const imageInput = document.getElementById('image');
const environmentInput = document.getElementById('environment');
const userInput = document.getElementById('user');
const output = document.getElementById('output');
const imRes = document.getElementById('imRes');

imageInput.addEventListener('change', (e) => processFiles(e.target.files));

environmentInput.addEventListener('change', (e) =>
  processFiles(e.target.files)
);

userInput.addEventListener('change', (e) => processFiles(e.target.files));

var processFiles = (files) => {
  const url = URL.createObjectURL(files[0]);
  output.innerHTML = `<a href=${url} download>${files[0].name}</a><br/>`;
  imRes.src = url;
};

window.addEventListener('load', () => {
  console.log('load');
  environmentInput.focus();
  window.setTimeout(() => environmentInput.click(), 100);
});
