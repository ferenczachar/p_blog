const h1 = document.querySelector('h1');
const form = document.querySelector('form');
const inputs = document.querySelectorAll('input');
let username = document.querySelector('#username');
let password = document.querySelector('#password');
const errorMsg = document.querySelector('#error');


form.addEventListener('submit', async (e) => {
    if (username.value === '' || password.value === ''){
        e.preventDefault();
        errorMsg.innerHTML = "Please enter both username and password";
        form.reset();
    }
});