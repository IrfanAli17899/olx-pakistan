var token = localStorage.getItem("_t");
var userId;
var crrUserImg;
var crrUserName;
var crrUserData;
try {
    var storage = firebase.storage();
} catch (e) {
}

//*******************Authentication*********//
var page = location.href.split("/").pop().split(".")[0]
if (page == 'login' || page == 'register') {
} else {
    authUser();
}
initiateLoader();
if (page == 'index' || page == '') {
    // fetchIndexAds();
} else {
    // initiateLoader(`${page.toUpperCase()}List`)
}
function authUser() {
    if (token) {
        if (document.querySelector("#logIn")) {
            document.querySelector("#logIn").style.display = 'none';
        }
        document.querySelector('#user').innerHTML = `
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        `
        fetch('/auth', {
            headers: {
                "x-auth": token
            }
        })
            .then((res) => res.json())
            .then((userData) => {
                var HTML = "";
                crrUserImg = userData.userImg;
                crrUserName = userData.name;
                HTML += createUserTray(userData);
                crrUserData = userData;
                document.querySelector('#user').innerHTML = HTML;
            })
        // switch (page) {
        //     case "fav":
        //         fetchFavAd(userId)
        //         break;
        //     case "myAds":
        //         fetchMyAd("mobiles");
        //         fetchMyAd("cars");
        //         fetchMyAd("bikes")
        //         fetchMyAd("electronicsAppliances");
        //         fetchMyAd("furniture");
        //         fetchMyAd("realEstate");
        //         break;
        //     case "notification":
        //         var cat = JSON.parse(localStorage.getItem('category'));
        //         var key = JSON.parse(localStorage.getItem('productKey'));
        //         if (cat && key) {
        //             getNotification(userId, cat, key)
        //             break;
        //         }
        //     case "buy":
        //         getChat(userId)
        //         break;
        // }

        // messaging.requestPermission()
        //     .then(() => {
        //         console.log("Permission Granted");
        //         return messaging.getToken()
        //     }).then((token) => {
        //         console.log(token);
        //         database.ref(`tokens/${userId}`).set({
        //             token: token
        //         })
        //     })
        // messaging.onMessage(function (payload) {
        //     console.log('payload', payload);
        // })
    } else {
        // No user is signed in.
        if (page === 'post-ad' || page === 'fav' || page === 'notification' || page === 'myAds' || page === 'buy') {
            location.href = 'login.html'
        }
    }
}

//**************************Ad Creators**********************//

// function createDefaultAd(category) {
//     var list = document.querySelector(`#${category}List`)
//     if (list) {
//         fetchData(category)
//             .then((ads) => {
//                 var HTML = "";
//                 for (var ad in ads) {
//                     HTML += createAd(ads[ad])
//                 }
//                 removeLoader(`#${category}List`)
//                 list.innerHTML = HTML;
//             })
//     }
// }
//**************************INDEX/ADS********************//
function fetchIndexAds() {
    fetch('/index.html/getAds').then((res) => {
        return res.json();
    }).then((ads) => {
        var HTML = "";
        for (var i in ads) {
            var div = document.createElement('div');
            div.className = `animated fadeInRight`
            div.innerHTML = createAd(ads[i])
            if (i < 3) {
                document.querySelector('#list1').appendChild(div)
            }
            else if (i >= 3 && i < 6) {
                document.querySelector('#list2').appendChild(div)
            }
            else if (i >= 6 && i < 9) {
                document.querySelector('#list3').appendChild(div)
            }
        }
        removeLoader(`#indexLoader`)
    })
}
//********************Category/Ads***********************//
fetchCategoryAds(page)
function fetchCategoryAds(page) {
    if (!document.querySelector(`#${page.toUpperCase()}List`)) {
        return;
    }
    console.log(page, document.querySelector(`#${page.toUpperCase()}List`));

    fetch(`/getCategoryAds/${page}`).then((res) => {
        return res.json()
    }).then((ads) => {
        console.log(ads);
        console.log("WORKING");
        if (!ads.length) {
            console.log("WORKING");
            document.querySelector(`#${page.toUpperCase()}List`).innerHTML = "<strong>NO AD FOR THIS CATEGORY YET</strong>"
            return;
        }
        var HTML = "";
        for (var i in ads) {
            HTML += createAd(ads[i])
        }
        document.querySelector(`#${page.toUpperCase()}List`).innerHTML = HTML
    })
}












//**********************Post-Ad******************//
function postAd() {
    createMsg("primary", "processing Given Data")
    var formData = new FormData(document.querySelector("#postForm"));
    // var item = database.ref(`ads/catogaries/${formData.get('category')}`).push()
    // var productKey = item.key;
    var img = document.querySelector('#photoSelect').files[0]
    if (!img) {
        createMsg("danger", "Image Is Required");
        return false
    }
    storage.ref(`adsImg/${formData.get('category')}/${img.name + Math.random()}`).put(img)
        .then((snapShot) => {
            return snapShot.ref.getDownloadURL();
        })
        .then((url) => {
            fetch('/post-ad.html', {
                method: "POST",
                headers: {
                    "Accept": 'application/json',
                    "Content-type": 'application/json',
                    "x-auth": token
                },
                body: JSON.stringify({
                    category: formData.get("category"),
                    src: url,
                    adDate: (new Date()).toDateString(),
                    price: formData.get("price"),
                    model: formData.get('model'),
                    title: formData.get("title"),
                    description: formData.get("description")
                })
            }).then((res) => {
                return res.json()
            }).then((result) => {
                console.log(result);
                if (!result.errors) {
                    // .then(() => {
                    //     database.ref("notifications/notification").set({
                    //         posterName: crrUserName,
                    //         productImg: url,
                    //         category: formData.get("category"),
                    //         msgDate: (new Date()).toLocaleDateString(),
                    //         msgTime: (new Date()).toLocaleTimeString(),
                    //     })
                    // })
                    createMsg("success", "Posted Successfully")
                    document.querySelector("#postForm").reset();
                    document.querySelector('#picShow').src = 'images/upload.png'
                } else {
                    throw result
                }
            }).catch((err) => {
                var errors = err.errors;
                for (var err in errors) {
                    createMsg('danger', err + ' : ' + errors[err].message)
                    console.log("err:", err)
                }
            })
        })
        .catch((err) => {
            console.log(err);
            createMsg("danger", err.message)
        })

}
//***************************UserCreation And Login************************//

//****************************SignUp*******************//
function signUpUser() {
    createMsg("primary", "Processing Your Information")
    var form = new FormData(document.querySelector("#signUpForm"));
    var img = document.querySelector('#imgPicker').files[0]
    if (!img) {
        createMsg("danger", "User Image Is Required")
        return false;
    }
    storage.ref(`userImg/${img.name + Math.random()}`).put(img)
        .then((snapShot) => {
            return snapShot.ref.getDownloadURL();
        }).then((url) => {
            fetch('/register.html', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.get('username'),
                    email: form.get('email'),
                    password: form.get("password"),
                    contact: form.get("contact"),
                    userImg: url
                })
            }).then((res) => {
                return res.json()

            }).then((result) => {
                if (!result.errors) {
                    console.log(result);
                    createMsg("success", "Your Account Is Successfully Created");
                    document.querySelector("#signUpForm").reset();
                    document.querySelector('#userImg').src = 'images/userImg.jpg'
                    setTimeout(() => {
                        window.location.href = 'login.html'
                    }, (2000))
                } else {
                    throw result;
                }
            }).catch((e) => {
                var errors = e.errors;
                for (var err in errors) {
                    createMsg('danger', err + ' : ' + errors[err].message)
                    console.log("err:", err)
                }
            })

        }).catch((err) => {
            createMsg("danger", "You Must Be Online To SignUp")
            console.log(err);
        })

}
//signIn***************************
function signInUser() {
    let form = new FormData(document.querySelector('#signInForm'));
    fetch('/login.html', {
        method: "POST",
        headers: {
            "Accept": 'application/json',
            "Content-type": 'application/json'
        },
        body: JSON.stringify({
            email: form.get('email'),
            password: form.get("password")
        })
    }).then((res) => {
        localStorage.setItem("_t", res.headers.get('x-auth'));
        return res.json();
    }).then((result) => {
        if (!result.errors) {
            createMsg("success", "Successfully Logged In");
            document.querySelector("#signInForm").reset();
            setTimeout(() => {
                window.location.href = 'index.html'
            }, (2000))
        } else {
            throw result;
        }
    }).catch((e) => {
        var errors = e.errors;
        for (var err in errors) {
            createMsg('danger', err + ' : ' + errors[err].message)
            console.log("err:", err)
        }
    })
}

function signOut() {
    fetch('/logout', {
        headers: {
            "x-auth": token
        }
    }).then(() => {
        localStorage.removeItem("_t")
        location.reload();
    })
}
//
//******************************global***********************//







//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//
//***************************ReUseAbles***************************//





//LOADERS****************
function initiateLoader() {
    var list = document.querySelector(`.load`);
    if (list) {
        var div = document.createElement('div');
        div.className = 'lds-facebook loader'
        div.innerHTML = `
       <div></div><div></div><div></div>
       `
        list.appendChild(div);
    }
}
function removeLoader() {
    if (document.querySelector('.loader')) {
        document.querySelector('.load').removeChild(document.querySelector('.loader'))
        // if (document.querySelector(`#indexLoader`)) {
        //     document.querySelector(`#indexLoader`).removeChild(document.querySelector('.loader'))
        // } else if (document.querySelector(`#${category}List`)) {
        //     document.querySelector(`#${category}List`).removeChild(document.querySelector('.loader'))
        // }
    }
}


//createUserTray********************
function createUserTray(userData) {
    return `
            <div>
            <div class='displayBoxImg animated fadeInRight'>
            <a href='JavaScript:void(0)' id='userLink' style='display:block' >
            <img src = "${userData.userImg}" title=${userData.name} style='margin-top:5px;' alt = "user" id = 'activeUserImg'/></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'buy.html' title='Messages'><i class="fas fa-shopping-cart fa-lg"></i></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'myAds.html' title='My Ads'><i class="fa fa-list fa-lg"></i></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'fav.html' title='My Favourites'><i class="fa fa-star fa-lg"></i></a>
            </div>
            <div class='displayBox animated fadeInRight'>
            <a href = 'JavaScript:void(0)' title='Sign Out' onclick='signOut()'><i class="fas fa-power-off fa-lg"></i></a>
            </div>
            </div>
            
            `
}


//CreateMsg*****************
function createMsg(status, message) {
    if (document.querySelector('#infoMsg')) {
        document.body.removeChild(document.querySelector('#infoMsg'));
    }
    var p = document.createElement("p");
    p.className = `infoMsg ${status} animated fadeInDown`
    p.id = 'infoMsg';
    p.setAttribute('align', 'center')
    p.innerHTML = `
    <strong>${message}</strong>`
    document.body.appendChild(p);
    setTimeout(function () {
        document.querySelector("#infoMsg").classList += 'animated fadeOutUp'
    }, (3000))
}

//imageShow****************

function showImg(imageView, imageReader) {
    var picPreview = document.querySelector(`#${imageView}`);
    var inputFile = document.querySelector(`#${imageReader}`).files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        picPreview.src = reader.result;
    }, false);
    if (inputFile) {
        reader.readAsDataURL(inputFile);
    }
}


//********************Global-Ad-Creator*******************************//
function createAd(data) {
    var adData = JSON.stringify(data)
    return `
        <div class="col-sm-4 col-6  img-thumbnail cardDiv animated fadeIn" style='margin-bottom:5px;height:310px;'>
		<div class="card ">
			<div class="user-card-profile  text-center">
				<img class="" style='width:200px;height:150px;' src="${data.src}" alt="">
			</div>
			<div class="designation m-t-27 m-b-27 text-center">
				<h4> ${data.title}</h4>
			</div>
			<div class='adCont'>
				<div class='col-sm-6 col-xs-6 text-left adDiv'>
					<ul class='adUl'>
						<li>
							<i class="fas fa-money-check-alt"></i> Price</li>
						<li>
							<i class='fa fa-phone'></i> Contact</li>
					</ul>
				</div>
				<div class='col-sm-6 col-xs-6 text-right adDiv'>
					<ul class='adUl'>
						<li>${data.price} PKR</li>
						<li>${data.contact}</li>
					</ul>
				</div>
				<div class=' text-center adDateData'>
					<div class='col-sm-12 '>
                        <i class="far fa-clock"></i> ${data.adDate}
                    </div>
                </div>
					<div class='col-sm-12 detailBtn '>
						<a href='JavaScript:void(0)' class='btn btn-success' onclick='showAd(${adData})'>View Details</a>
                    </div>                    
				</div>
			</div>
		</div>
	</div>
	</div>
`
}