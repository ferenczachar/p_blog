//Authentication for register form
const form = document.querySelector('form');
const inputs = document.querySelectorAll('form input');
const error = document.querySelector('.errors');
const username = inputs[0].value;
const password1 = inputs[1].value;
const password2 = inputs[2].value;
const email = inputs[3].value;

form.addEventListener('submit', (e) => {
    inputs.forEach((input) => {
        if (!input.value) {
            e.preventDefault();
            error.innerHTML = `Please fill out the '${input.id}' field.`;
            console.log(`Please fill out the '${input.id}' field.`);
        } else if (inputs[0].value.length < 5 || inputs[0].value.length > 15) {
            e.preventDefault();
            error.innerHTML = 'Username length must be between 5-15 characters';
        } else if (inputs[1].value !== inputs[2].value) {
            e.preventDefault();
            error.innerHTML = "Passwords do not match";
        }
        else {
            return;
        }
    });
});

if (errorMsg) {
    error.innerHTML = errorMsg;
}

//1. Needs a Mongoose Schema + Model Setup, - done
//2. Needs a database collection, - done
//3. Users with duplicate username cannot be created - done
//4. Passwords need to be hashed.