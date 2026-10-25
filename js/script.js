// Shared data 
const movies = {
    'lilo-and-stitch': {
        title: 'Lilo & Stitch',
        price: 15,
        sessions: {
            '2026-10-25': ['16:30', '20:30'],
            '2026-10-26': ['14:00', '18:00']
        },
        genres: {

        }
    },
    'project-hail-mary': {
        title: 'Project Hail Mary',
        price: 18,
        sessions: {
            '2026-10-25': ['12:00', '19:00'],
            '2026-10-27': ['17:30']
        }
    },
    'the-first-slam-dunk': {
        title: 'The First Slam Dunk',
        price: 12,
        sessions: {
            '2026-10-26': ['15:00', '21:00'],
            '2026-10-27': ['13:00', '19:30']
        }
    },
    'little-miss-sunshine': {
        title: 'Little Miss Sunshine',
        price: 16,
        sessions: {
            '2026-10-25': ['10:30', '12:45'],
            '2026-10-27': ['12:30', '17:00']
        }
    },
    'resident-evil': {
        title: 'Resident Evil',
        price: 20,
        sessions: {
            '2026-10-25': ['17:00', '19:00'],
            '2026-10-26': ['15:00', '21:00'],
            '2026-10-27': ['13:30', '20:00']
        }
    },
    'look-back': {
        title: 'Look Back',
        price: 10,
        sessions: {
            '2026-10-26': ['16:30']
        }
    }
};

const cardLengths = { visa: 16, mastercard: 16, amex: 15 };
const cvvLengths = { visa: 3, mastercard: 3, amex: 4 };

const formatPrice = n => `$${n.toFixed(2)}`; // 15 -> $15.00
const formatDate = iso => iso.split('-').reverse().join('/');   // 2026-10-25 -> 25/10/2026

function formatTime(t) {                                          // 16:30 -> 4:30pm
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`;
}
// Sessions page 
document.querySelectorAll('.sessions_item_link').forEach(link => {
    link.addEventListener('click', e => {
        const movieEl = link.closest('.movies-list_item');
        const listEl = link.closest('.sessions_list');
        const dateEl = listEl ? listEl.previousElementSibling : null;   // the <h3> right before this list

        const movie = movieEl ? movieEl.dataset.movie : '';
        const date = dateEl ? dateEl.dataset.date : '';
        const time = link.dataset.time || '';

        // Placeholder links without session data just behave normally
        if (!movie || !date || !time) return;

        e.preventDefault();

        const params = new URLSearchParams({ movie, date, time });
        window.location.href = `booking.html?${params}`;
    });
});
// Recommendation page
const catalog = [
    { id: "lilo-and-stitch", title: "Lilo and Stitch", genres: ["sci-fi", "comedy", "animation"], age: "Kids", viewing: ["family", "friends", "date"] },
    { title: "The Raid", genres: ["action", "thriller"], age: "Adults", viewing: ["friends"] },
    { id: "project-hail-mary", title: "Project Hail Mary", genres: ["sci-fi", "comedy", "drama"], age: "Kids", viewing: ["family", "friends", "date"] },
    { title: "MidSommar", genres: ["horror", "thriller"], age: "Adults", viewing: ["friends", "solo"] },
    { id: "little-miss-sunshine", title: "Little Miss Sunshine", genres: ["comedy", "drama"], age: "Teens", viewing: ["date", "solo"] },
    { title: "Good Will Hunting", genres: ["comedy", "drama"], age: "Adults", viewing: ["date", "solo"] },
    { id: "the-first-slam-dunk", title: "The First Slam Dunk", genres: ["comedy", "drama", "sports", "animation"], age: "Teens", viewing: ["friends"] },
    { title: "The Devil Wears Prada", genres: ["romance", "drama"], age: "Teens", viewing: ["friends", "date"] },
    { title: "Sinners", genres: ["horror", "fantasy", "western", "romance", "thriller", "comedy"], age: "Adults", viewing: ["friends", "date", "solo"] },
    { title: "The Lego Batman Movie", genres: ["action", "sci-fi", "comedy", "drama", "animation"], age: "Kids", viewing: ["family", "friends", "date"] },
    { title: "MoneyBall", genres: ["drama", "sports"], age: "Teens", viewing: ["friends", "solo"] },
    { title: "Spider-Man: Brand New Day", genres: ["action", "sci-fi", "romance", "comedy", "drama"], age: "Teens", viewing: ["family", "friends", "date", "solo"] },
    { title: "The End of Oak Street", genres: ["horror", "sci-fi", "romance", "comedy"], age: "Teens", viewing: ["friends", "date", "solo"] },
    { title: "The Perks of Being a Wallflower", genres: ["romance", "comedy", "drama"], age: "Teens", viewing: ["friends", "solo"] },
    { id: "resident-evil", title: "Resident Evil", genres: ["horror", "sci-fi", "comedy"], age: "Adults", viewing: ["friends", "date", "solo"] },
    { title: "Leviticus", genres: ["horror", "romance", "thriller"], age: "Teens", viewing: ["date", "solo"] },
    { title: "100 Metres", genres: ["action", "drama", "sports", "animation"], age: "Teens", viewing: ["friends", "solo"] },
    { title: "Obsession", genres: ["horror", "thriller", "comedy"], age: "Adults", viewing: ["friends", "date", "solo"] },
    { id: "look-back", title: "Look Back", genres: ["comedy", "drama", "animation"], age: "Teens", viewing: ["friends", "date", "solo"] }
];

// Rule 1 (filter): the age group sets which movies can be shown.
// Kids = Kids only, Teens = Kids + Teens, Adults = everything.
const ageRank = { Kids: 0, Teens: 1, Adults: 2 };
const maxAgeRank = { child: 0, teen: 1, adult: 2 };
const ageToData = { child: 'Kids', teen: 'Teens', adult: 'Adults' };

const viewingLabels = { family: 'family', date: 'date night', friends: 'friends', solo: 'solo' };

const MAX_RESULTS = 5;

function getRecommendations(genre, age, viewing) {
    return catalog
        // Rule 1: the movie's age group must not be above the user's age group
        .filter(m => ageRank[m.age] <= maxAgeRank[age])
        // Rule 2 (filter): Family viewing only includes movies flagged as family-friendly
        .filter(m => viewing !== 'family' || m.viewing.includes('family'))
        // Rules 3-5 (score): rank whatever is left
        .map(m => {
            let score = 0;
            const reasons = [];

            // Rule 3: genre match is the strongest signal
            if (m.genres.includes(genre)) {
                score += 3;
                reasons.push(`it's a ${genre} movie`);
            }

            // Rule 4: the movie is flagged as suitable for this viewing preference
            if (m.viewing.includes(viewing)) {
                score += 2;
                reasons.push(`it suits ${viewingLabels[viewing]} viewing`);
            }

            // Rule 5: the movie's age group is exactly the user's age group
            if (m.age === ageToData[age]) {
                score += 1;
                reasons.push(`it's aimed at ${m.age.toLowerCase()}`);
            }

            return { ...m, score, reasons };
        })
        // Highest score first; on a tie, the movie with fewer genres (more focused) first
        .sort((a, b) =>
            b.score - a.score ||
            a.genres.length - b.genres.length ||
            a.title.localeCompare(b.title)
        );
}

const recommendForm = document.getElementById('recommend-form');

if (recommendForm) {
    const resultsEl = document.getElementById('recommend-results');

    function renderResults(results, genre) {
        resultsEl.innerHTML = '';

        const exact = results.filter(m => m.genres.includes(genre));
        const shown = (exact.length ? exact : results.filter(m => m.score > 0)).slice(0, MAX_RESULTS);

        if (shown.length === 0) {
            resultsEl.textContent = 'Sorry, no movies match those choices. Try a different age group or viewing preference.';
            return;
        }

        const heading = document.createElement('h2');
        heading.textContent = exact.length ? 'Your recommendations' : 'Closest matches';
        resultsEl.append(heading);

        if (!exact.length) {
            const note = document.createElement('p');
            note.textContent = `We have no ${genre} movies that suit those choices, so here are the closest alternatives.`;
            resultsEl.append(note);
        }

        shown.forEach(m => {
            const card = document.createElement('article');
            card.className = 'recommend_card';

            const title = document.createElement('h3');
            title.textContent = m.title;

            const meta = document.createElement('p');
            meta.textContent = `${m.genres.join(', ')} | ${m.age}`;

            const why = document.createElement('p');
            why.textContent = m.reasons.length ? `Why: ${m.reasons.join(', ')}.` : '';

            card.append(title, meta, why);

            if (m.id && movies[m.id]) {
                const book = document.createElement('a');
                book.href = `booking.html?movie=${encodeURIComponent(m.id)}`;
                book.textContent = 'Book tickets';
                card.append(book);
            } else {
                const nobook = document.createElement('span');
                nobook.textContent = `There are currently no sessions available for ${m.title}`;
                card.append(nobook);
            }

            resultsEl.append(card);
        });
    }

    recommendForm.addEventListener('submit', e => {
        e.preventDefault();

        const genre = document.getElementById('rec-genre').value;
        const age = document.getElementById('rec-age').value;
        const viewing = document.getElementById('rec-viewing').value;

        renderResults(getRecommendations(genre, age, viewing), genre);
    });
}
// recycled validation code from week 9 
/* write functions that define the action for each event */
function validate() {
    var uname = document.getElementById("uname").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var pwd1 = document.getElementById("pwd1").value;
    var pwd2 = document.getElementById("pwd2").value;

    var genm = document.getElementById("genm").checked;
    var genf = document.getElementById("genf").checked;
    var gennb = document.getElementById("gennb").checked;
    var genp = document.getElementById("genp").checked;
    var genres = document.querySelectorAll('.movies-reg_genre:checked').length;
    var country = document.getElementById("country").value;
    var region = document.getElementById("region").value;

    var errMsg = "";								/* stores the error message */
    var result = true;							/* assumes no errors */
    var pattern = /^\w+$/;                      // regular expression for letters numbers and underscores
    var hasNumber = /[0-9]/                    
    var phpattern = /^[0-9 ]+$/               //regular expression for numbers only
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Username
    if (uname == ("")) {
        errMsg += "Username cannot be empty.\n";
    }
    if (uname.length < 5) {
        errMsg += "User name must be atleast 5 Characters long.\n";
    }
    if (!uname.match(pattern) && uname != ("")) {
        errMsg += "User name can only contain letters, numbers, and underscores\n";
    }
    // email
    if (email == ("")) {
        errMsg += "Email cannot be empty.\n";
    }
    if (email.indexOf('@') == 0) {
        errMsg += "Email cannot start with an @ symbol.\n";
    }
    if (email.indexOf('@') < 0) {
        errMsg += "Email must contain an @ symbol.\n";
    }
    if (!email.match(emailPattern) && email != ("")) {
        errMsg += "Enter a valid email address\n";
    }
    // phone
    if (phone == ("")) {
        errMsg += "Phone number cannot be empty.\n";
    }
    if (phone.length < 8 || phone.length > 15) {
        errMsg += "Phone number must be between 8 and 15 digits.\n";
    }
    if (!phone.match(phpattern) && phone != ("")) {
        errMsg += "Phone number can only contain digits\n";
    }
    //password
    if (pwd1 == ("")) {
        errMsg += "Password cannot be empty.\n";
    }
    if (pwd2 == ("")) {
        errMsg += "Retype password cannot be empty.\n";
    }
     if (pwd1 != pwd2) {
        errMsg += "Passwords do not match.\n";
    }
    if (pwd1.length < 10) {
        errMsg += "Password must be atleast 10 Characters long.\n";
    }
    if (pwd1 == pwd1.toLowerCase() || pwd1 == pwd1.toUpperCase()) {
        errMsg += "Password must contain atleast 1 Uppercase and 1 Lowercase Character.\n";
    }
    if (pwd1 != "" && !pwd1.match(hasNumber)) {
        errMsg += "Password must contain at least 1 number.\n";
    }
    if (pwd1 != "" && !pwd1.match(/[^A-Za-z0-9]/)) {
        errMsg += "Password must contain at least 1 special character.\n";
    }
    //gender
    if (genm == ("") && genf == ("") && gennb == ("") && genp == ("")) {
        errMsg += "A gender must be selected.\n";
    }
    //country/region
    if (country == ("")) {
        errMsg += "Country cannot be empty.\n";
    }
    if (region == ("")) {
        errMsg += "Region cannot be empty.\n";
    }
    //genres
    if (genres == 0) {
        errMsg += "Select at least 1 preferred genre.\n";
    } 
    
    /* Display error message any error(s) is/are detected */
    if (errMsg != "") {
        alert(errMsg);
        result = false;
    }
    return result;
}
var regForm = document.getElementById("regform");

if (regForm) {
    regForm.noValidate = true;   // stops the browser's own pop-ups getting in the way
    regForm.addEventListener("submit", function (e) {
        if (!validate()) {
            e.preventDefault();
        }
    });
}
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.noValidate = true;   // use our messages, not the browser's pop-ups

    // Elements 
    const nameInput = document.getElementById('Fname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const movieSelect = document.getElementById('movie');
    const dateSelect = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const ticketsInput = document.getElementById('tickets');
    const unitPriceEl = document.getElementById('unit-price');
    const totalPriceEl = document.getElementById('total-price');

    const paymentSelect = document.getElementById('payment');
    const voucherInput = document.getElementById('voucher');
    const voucherField = voucherInput.closest('.textinput');
    const cardDetails = document.getElementById('card-details');
    const cardTypeSelect = document.getElementById('card-type');
    const cardInput = document.getElementById('card');
    const expInput = document.getElementById('cardexp');
    const cvvInput = document.getElementById('cvv');

    const billingInput = document.getElementById('billing');
    const sameEmail = document.getElementById('same-email');

    // Build movie dropdown from the movies object
    Object.entries(movies).forEach(([id, movie]) => {
        movieSelect.add(new Option(movie.title, id));
    });

    // --- Dynamic date/time dropdowns ---
    function fillSelect(select, items, placeholder) {
        select.innerHTML = '';
        const first = new Option(placeholder, '', true, true);
        first.disabled = true;
        select.add(first);
        items.forEach(({ value, label }) => select.add(new Option(label, value)));
    }

    function updateTimes() {
        const movie = movies[movieSelect.value];
        const times = movie && movie.sessions[dateSelect.value] ? movie.sessions[dateSelect.value] : [];

        let placeholder = 'Choose a movie first';
        if (movie) placeholder = dateSelect.value ? 'Choose a time' : 'Choose a date first';

        fillSelect(
            timeSelect,
            times.map(t => ({ value: t, label: formatTime(t) })),
            placeholder
        );
    }

    function updateDates() {
        const movie = movies[movieSelect.value];
        const dates = movie ? Object.keys(movie.sessions).sort() : [];

        fillSelect(
            dateSelect,
            dates.map(d => ({ value: d, label: formatDate(d) })),
            movie ? 'Choose a date' : 'Choose a movie first'
        );
        updateTimes();
    }

    function setIfValid(select, value) {
        if (value && [...select.options].some(o => o.value === value)) {
            select.value = value;
        }
    }

    // --- Price calculation ---
    function updatePrice() {
        const movie = movies[movieSelect.value];
        const qty = parseInt(ticketsInput.value, 10) || 0;
        const unit = movie ? movie.price : 0;

        unitPriceEl.textContent = formatPrice(unit);
        totalPriceEl.textContent = formatPrice(unit * qty);
    }

    // --- Show/hide payment fields ---
    function updatePaymentFields() {
        const isOnline = paymentSelect.value === 'O';

        cardDetails.hidden = !isOnline;
        voucherField.hidden = isOnline;

        // If the expiry box sits outside #card-details, hide it with the card fields
        if (expInput && !cardDetails.contains(expInput)) {
            expInput.closest('.textinput').hidden = !isOnline;
        }

        cardInput.placeholder = `${cardLengths[cardTypeSelect.value]} digits`;
    }

    // --- Billing email: "Same as email address" ---
    function syncBillingEmail() {
        if (!sameEmail) return;
        if (sameEmail.checked) {
            billingInput.value = emailInput.value;
            billingInput.readOnly = true;
        } else {
            billingInput.readOnly = false;
        }
    }

    function validateBooking() {
        var fname = nameInput.value.trim();
        var email = emailInput.value.trim();
        var phone = phoneInput.value.trim();
        var tickets = ticketsInput.value.trim();
        var billing = billingInput.value.trim();

        var errMsg = "";								/* stores the error message */
        var numpattern = /^[0-9]+$/;                 //regular expression for numbers only
        var phpattern = /^[\d\s+()-]+$/;
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Rule 1, check if all required inputs have value
        if (fname == ("")) {
            errMsg += "Full name cannot be empty.\n";
        }
        if (email == ("")) {
            errMsg += "Email cannot be empty.\n";
        }
        if (phone == ("")) {
            errMsg += "Phone number cannot be empty.\n";
        }

        if (movieSelect.value == ("")) {
            errMsg += "Please select a movie.\n";
        }
        if (dateSelect.value == ("")) {
            errMsg += "Please select a date.\n";
        }
        if (timeSelect.value == ("")) {
            errMsg += "Please select a time.\n";
        }
        if (tickets == ("")) {
            errMsg += "Number of tickets cannot be empty.\n";
        }
        if (paymentSelect.value == ("")) {
            errMsg += "Please select a payment method.\n";
        }
        if (billing == ("")) {
            errMsg += "Billing email cannot be empty.\n";
        }
        // Rule 2, check if email is in correct format
        if (!email.match(emailPattern) && email != ("")) {
            errMsg += "Enter a valid email address\n";
        }
        if (!billing.match(emailPattern) && billing != ("")) {
            errMsg += "Enter a valid billing email address\n";
        }

        // Rule 3, check if phone is atleast 10 digits and correct characters */
        if (phone != ("")) {
            var digitCount = phone.replace(/\D/g, '').length;
            if (!phone.match(phpattern) && phone != ("")) {
                errMsg += 'Phone number can only contain digits, spaces, + - and brackets.\n';
            } else if (digitCount < 10) {
                errMsg += 'Phone number must contain at least 10 digits.\n';
            }
        }
        // Rule 4, check if date and time are not in the past
        if (dateSelect.value != ("") && timeSelect.value != ("")) {
            var screening = new Date(`${dateSelect.value}T${timeSelect.value}`);
            if (screening < new Date()) {
                errMsg += "The screening date and time cannot be the past. \n";
            }
        }
        // Rule 5 Check if tickets are a whole number > 0
        if (tickets != ("")) {
            var qty = Number(tickets);
            if (!Number.isInteger(qty) || qty <= 0) {
                errMsg += "Number of tickets must be a whole number greater than 0.\n";
            }
        }
        // validating card details 
        if (paymentSelect.value == ("O")) {
            const cardType = cardTypeSelect.value;
            const card = cardInput.value.trim();
            const required = cardLengths[cardType];
            const cardNames = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express' };

            if (card == ("")) {
                errMsg += 'Card number cannot be empty.\n';
            } else if (!/^\d+$/.test(card)) {
                errMsg += 'Card number can only contain digits (no spaces or dashes).\n';
            } else if (card.length !== required) {
                errMsg += `${cardNames[cardType]} card numbers must be ${required} digits.\n`;
            }

            if (expInput) {
                var exp = expInput.value.trim();
                var exppattern = /^(0[1-9]|1[0-2])\s*\/\s*(\d{4})$/;
                var match = exp.match(exppattern);

                if (exp == ("")) {
                    errMsg += "Card expiry cannot be empty.\n";
                } else if (!match) {
                    errMsg += "Card expiry must be the format MM / YYYY.\n";
                } else {
                    var endOfMonth = new Date(Number(match[2]), Number(match[1]), 1)
                    if (endOfMonth <= new Date()) {
                        errMsg += "This card has expired.\n";
                    }
                }
            }
            if (cvvInput) {
                var cvv = cvvInput.value.trim();
                var cvvRequired = cvvLengths[cardType];
                var numpattern = /^[0-9]+$/;

                if (cvv === '') {
                    errMsg += 'CVV cannot be empty.\n';
                } else if (!cvv.match(numpattern)) {
                    errMsg += 'CVV can only contain digits.\n';
                } else if (cvv.length !== cvvRequired) {
                    errMsg += `${cardNames[cardType]} CVV must be ${cvvRequired} digits.\n`;
                }
            }
        }
        /* Display error message any error(s) is/are detected */
        if (errMsg != "") {
            alert(errMsg);
            return false;
        }
        return true;
    }
    // --- Events ---
    movieSelect.addEventListener('input', () => {
        updateDates();
        updatePrice();
    });

    dateSelect.addEventListener('input', updateTimes);
    ticketsInput.addEventListener('input', updatePrice);
    paymentSelect.addEventListener('input', updatePaymentFields);
    cardTypeSelect.addEventListener('input', updatePaymentFields);

    if (sameEmail) {
        sameEmail.addEventListener('change', () => {
            if (!sameEmail.checked) billingInput.value = '';
            syncBillingEmail();
        });
        emailInput.addEventListener('input', syncBillingEmail);
    }

    bookingForm.addEventListener('submit', e => {
        if (!validateBooking()) e.preventDefault();
    });

    // --- Prefill from URL (order matters: each step builds the next list) ---
    const params = new URLSearchParams(window.location.search);

    setIfValid(movieSelect, params.get('movie'));
    updateDates();
    setIfValid(dateSelect, params.get('date'));
    updateTimes();
    setIfValid(timeSelect, params.get('time'));

    // --- Initial state (after prefill) ---
    updatePrice();
    updatePaymentFields();
}
