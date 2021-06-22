const imageInput = document.getElementById('image');
const environmentInput = document.getElementById('environment');
const userInput = document.getElementById('user');
const output = document.getElementById('output');
const imRes = document.getElementById('imRes');

// var res;

imageInput.addEventListener('change', (e) => processFiles(e.target.files));
environmentInput.addEventListener('change', (e) => processFiles(e.target.files));
userInput.addEventListener('change', (e) => processFiles(e.target.files));

var processFiles = (files) => {
    // output.innerHTML = files;
    // res = files;
    imRes.src = URL.createObjectURL(files[0]);
}