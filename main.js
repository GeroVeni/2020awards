function colorchange(event) {
    console.log(event.target.value);
    //document.getElementById("time-remaining").style.color = event.target.value;
}

document.getElementById("audio").volume = 0.15;

let categoryTemplate =
    '<div class="surface card" id="category-{card-id}">' +
    '<div class="w3-row">' +
    '<div class="w3-col s6">' +
    '<h3>{name}</h3>' +
    '</div>' +
    '<div class="w3-col s6">' +
    '<p>{description}</p>' +
    '</div>' +
    '</div>' +
    '<img src="images/alex.jpg" class="small selectable" onclick="selectVote(event, \'category-{card-id}\', \'1\')" alt="Alex">' +
    '<img src="images/george.jpg" class="small selectable disabled" onclick="selectVote(event, \'category-{card-id}\', \'2\')" alt="George">' +
    '<img src="images/helen.jpg" class="small selectable" onclick="selectVote(event, \'category-{card-id}\', \'3\')" alt="Helen">' +
    '<img src="images/john.jpg" class="small selectable" onclick="selectVote(event, \'category-{card-id}\', \'4\')" alt="John">' +
    '<img src="images/bill.jpg" class="small selectable" onclick="selectVote(event, \'category-{card-id}\', \'5\')" alt="Bill">' +
    '</div>';
let headerGreeting = document.getElementById('header-greeting');
let cardList = document.getElementById('card-list');
let categoriesCache = {};

let modal = document.getElementById("details-modal");
let modalTitle = document.getElementById("modal-title");
let modalDetails = document.getElementById("modal-details");
// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function fillCategories(categories) {
    categoriesCache = categories;
    cardList.innerHTML = "";
    console.log(categories);
    categories.forEach(cat => {
        const data = {
            'card-id': cat.id,
            name: cat.name,
            description: cat.description
        };
        cardList.appendChild(makeItem(categoryTemplate, data));
    });
}

function openCategoryDetails(cardID) {
    console.log('clicked ' + cardID);
    modal.style.display = "block";
    let cat = {};
    for (k in categoriesCache) {
        if (categoriesCache[k].id == cardID) {
            cat = categoriesCache[k];
            break;
        }
    }
    modalTitle.innerHTML = cat.name;
    modalDetails.innerHTML = cat.description;
}

function submitVotes(token, votes) {
    const data = {
        token: token,
        votes: votes
    };
    fetch('https://gv281.user.srcf.net/2020awards/api/votes', {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.error(error));
}

function selectVote(event, cardID, candidate) {
    event.stopPropagation();
    console.log('selected: ' + cardID + ' ' + candidate);
    if (getUserIDFromEmail(firebase.auth().currentUser.email) == candidate) return;
    let card = document.getElementById(cardID);
    for (let i = 0; i < card.children.length; i++) {
        if (parseInt(candidate) == i) {
            card.children[i].classList.add('selected');
        } else {
            card.children[i].classList.remove('selected');
        }
    }
}

function onSubmitVotesClicked() {
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
            let votes = {};
            for (let i = 0; i < cardList.children.length; i++) {
                let card = cardList.children[i];
                let categoryID = card.id.split('-')[1];
                for (let j = 0; j < card.children.length; j++) {
                    let item = card.children[j];
                    if (item.classList.contains('selected')) {
                        votes[categoryID] = '' + j;
                        break;
                    }
                }
            }
            console.log('sending votes');
            console.log(votes);
            submitVotes(idToken, votes);
        })
        .catch(error => console.error(error));
}

function loadCategories() {
    fetch('https://gv281.user.srcf.net/2020awards/api/categories')
        .then(response => response.json())
        .then(result => fillCategories(result));
}
loadCategories();

function loadVotingList(token) {
    console.log(token);
    fetch(`https://gv281.user.srcf.net/2020awards/api/votes?token=${token}`)
        .then(response => response.json())
        .then(result => {
            let votes = result.content;
            console.log(votes);
            for (key in votes) {
                let card = document.getElementById('category-' + key);
                card.children[parseInt(votes[key])].classList.add('selected');
            }
        });
}

function getUserIDFromEmail(email) {
    if (email == 'alexlik1997@gmail.com') return '1';
    if (email == 'geroveni@gmail.com') return '2';
    if (email == 'evieleni99@gmail.com') return '3';
    if (email == 'johnv12345678@gmail.com') return '4';
    if (email == 'billdolop@gmail.com') return '5';
    return '0';
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User signed in
        headerGreeting.textContent = `How you doin', ${user.displayName}!`;
        user.getIdToken(/* forceRefresh */ true).then(function (idToken) {
            loadVotingList(idToken);
        }).catch(function (error) {
            // Handle error
            console.log(`Could not retrieve id token from user: ${error}`);
            console.log(user);
        });
    } else {
        // No user signed in
        location.href = `${ROOT}/signin.html`;
    }
});

function logout() {
    firebase.auth().signOut().then(function () {
        console.log("Signout successful");
    }).catch(function (error) {
        console.error(error);
    });
}

// Set the date we're counting down to
var countDownDate = new Date("Jan 1, 2021 04:00:00 UTC+02:00").getTime();

// Update the count down every 1 second
var x = setInterval(function () {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("time-remaining").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";

    let color = "white";
    if (distance < 1000 * 60 * 60 * 24 * 7) color = "#ff3838";
    if (distance < 1000 * 60 * 60 * 24) color = "#ff3838";
    document.getElementById("time-remaining").style.color = color;

    // If the count down is finished, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("time-remaining").innerHTML = "Voting has closed!";
    }
}, 1000);
