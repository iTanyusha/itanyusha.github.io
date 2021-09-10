// const imageInput = document.getElementById('image');
const environmentInput = document.getElementById('environment');
// const userInput = document.getElementById('user');
const output = document.getElementById('output');
const imRes = document.getElementById('imRes');
// const envButton = document.getElementById('envButton');

// imageInput.addEventListener('change', (e) => processFiles(e.target.files));

environmentInput.addEventListener('change', (e) =>
  processFiles(e.target.files)
);

// userInput.addEventListener('change', (e) => processFiles(e.target.files));

// envButton.addEventListener('click', () =>
//   window.setTimeout(() => {
//     // environmentInput.click(),
//     $('#environment').trigger('click');
//   }, 0)
// );

var processFiles = (files) => {
  const url = URL.createObjectURL(files[0]);
  output.innerHTML = `<a href=${url} download>${files[0].name}</a><br/>`;
  imRes.src = url;
};

window.addEventListener('load', async () => {
  console.log('load');

  try {
    await navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(async (stream) => {
        await navigator.mediaDevices
          .enumerateDevices()
          .then((devices) =>
            devices.filter((device) => device.kind === 'videoinput')
          );

        stream.getTracks().forEach((track) => track.stop());
      });
    window.console.log('camera on');
    environmentInput.focus();
    window.setTimeout(() => environmentInput.click(), 100);
  } catch (e) {
    window.console.log('camera off', e);
  }

  // envButton.click(); //.dispatchEvent(new MouseEvent('click'));
  // $('#envButton').trigger('click');

  // $('body').append(
  //   "<input id='aidCameraInput' type='file' capture='environment' accept='image/*'></input>"
  // );
  // $('#aidCameraInput').focus();
  // $('#aidCameraInput').click();
  // setTimeout(function () {
  //   console.log('aaaa');
  //   $('#aidCameraInput').click();
  // }, 1000);
});
