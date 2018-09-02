var token = localStorage.getItem("_t");
var userId;
var crrUserImg;
var crrUserName;
var crrUserData;
try {
    var storage = firebase.storage();
} catch (e) {
}
//LOADERS****************
function initiateLoader(list) {
    console.log(list);
    var list = document.querySelector(`#${list}`);
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
        if (document.querySelector(`#indexLoader`)) {
            document.querySelector(`#indexLoader`).removeChild(document.querySelector('.loader'))
        } else if (document.querySelector(`#${category}List`)) {
            document.querySelector(`#${category}List`).removeChild(document.querySelector('.loader'))
        }
    }
}
//*******************Authentication*********//
var page = location.href.split("/").pop().split(".")[0]
if (page == 'login' || page == 'register') {
} else {
    authUser();
}
if (page == 'index' || page == '') {
    initiateLoader('indexLoader');
    // fetchAds('mobiles')
    // fetchAds('cars')
    // fetchAds('bikes')
} else {
    initiateLoader(`${page.toUpperCase()}List`)
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
    }, (4000))
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
