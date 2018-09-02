try {
    var storage = firebase.storage();
} catch (e) {
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
                    contact: Number(form.get("contact")),
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
            createMsg("success", "Successfully LoggedIn");
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


