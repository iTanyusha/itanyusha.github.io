let wMin = document.getElementById('wMin');
let wIdeal = document.getElementById('wIdeal');
let wMax = document.getElementById('wMax');
let hMin = document.getElementById('hMin');
let hIdeal = document.getElementById('hIdeal');
let hMax = document.getElementById('hMax');

const getCams = document.getElementById('getCams');
const select = document.getElementById('select');

const cameras = [];
let currentCameraId;
let currentStream;

const cameraLabels = [
  'передней панели',
  'Front Camera',
  'front',
  'Caméra avant',
  '前置相机',
  '前置相機',
  '前置鏡頭',
  'Cámara frontal',
  'Càmera frontal',
  'Frontkamera',
  'Câmara da frente',
  'Fotocamera anteriore',
  'Ön Kamera',
  '前面カメラ',
  '전면 카메라',
  'Camera aan voorzijde',
  'الكاميرا الأمامية',
  'กล้องด้านหน้า',
  'Kamera på framsidan',
  'Forsidekamera',
  'Camera mặt trước',
  'Kamera foran',
  'Przedni aparat',
  'Etukamera',
  'Kamera Depan',
  'מצלמה קדמית',
  'Μπροστινή κάμερα',
  'Cameră față',
  'Elülső kamera',
  'Přední fotoaparát',
  'Predná kamera',
  'Передня камера',
  'Kamera Depan',
  'फ़्रंट कैमरा',
];

const checkCameraCapabilities = (device) =>
  !cameraLabels.some((label) => device.label.indexOf(label) !== -1);

const testResolutions = async (camera) => {
  const constraints = {
    audio: false,
    video: {
      width: {
        min: Number(wMin.value),
        ideal: Number(wIdeal.value),
        max: Number(wMax.value),
      },
      height: {
        min: Number(hMin.value),
        ideal: Number(hIdeal.value),
        max: Number(hMax.value),
      },
      deviceId: {
        exact: camera,
      },
    },
  };

  return await navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      stream.getTracks().forEach((track) => track.stop());

      return true;
    })
    .catch(() => false);
};

const getArrPropsCameras = async (cameras) => {
  const camerasNewArr = [];

  for (const camera of cameras) {
    if (await testResolutions(camera.deviceId)) {
      camerasNewArr.push(camera);
    }
  }

  // if (camerasNewArr.length === 0) {
  //   throw new Error('no cameras with these conditions');
  // }

  return camerasNewArr;
};

const getCamera = async () => {
  await navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then(async (stream) => {
      const cameras = await navigator.mediaDevices
        .enumerateDevices()
        .then((devices) =>
          devices.filter(
            (device) =>
              device.kind === 'videoinput' && checkCameraCapabilities(device)
          )
        );

      stream.getTracks().forEach((track) => track.stop());

      const filteredCameras = await getArrPropsCameras(cameras);

      for (camera of filteredCameras) {
        var opt = document.createElement('option');
        opt.value = camera.deviceId;
        opt.innerHTML = camera.label;
        select.appendChild(opt);
      }

      if (filteredCameras.length > 0) select.disabled = false;

      getCams.disabled = false;
    });
};

getCams.onclick = async () => {
  getCams.disabled = true;

  await getCamera();
};

const getCameraResolution = (resolution) => {
  switch (true) {
    case resolution <= 600: // SVGA 800 x 600
      return [600, 800, 1280, 480, 600, 720];
    case resolution <= 720: // HD 1280 x 720
      return [800, 1280, 1920, 600, 720, 1080];
    case resolution <= 1080: // FullHD 1920 x 1080
      return [1280, 1920, 2560, 720, 1080, 1440];
    case resolution <= 1440: // 2K 2560 x 1440
      return [1920, 2560, 3840, 1080, 1440, 2160];
    case resolution <= 2160: // 4K 3840 x 2160
      return [2560, 3840, 5120, 1440, 2160, 2880];
    default:
      // 5K 5120 x 2880
      return [3840, 5120, 7680, 2160, 2880, 4320];
  }
};

stopStream = () => {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  currentStream = null;
};

startStreamToVideo = async () => {
  if (currentStream) {
    cameraService.stopStream();
  }

  if (!currentCameraId) return;

  await navigator.mediaDevices
    .getUserMedia({
      video: {
        width: {
          min: wMin.value,
          ideal: wIdeal.value,
          max: wMax.value,
        },
        height: {
          min: hMin.value,
          ideal: hIdeal.value,
          max: hMax.value,
        },
        deviceId: currentCameraId,
      },
    })
    .then((stream) => {
      currentStream = stream;
      video.srcObject = currentStream;
    });
};

const onSelectChange = async () => {
  stopStream();
  currentCameraId = select.value;
  await startStreamToVideo();
};

select.addEventListener('change', () => onSelectChange());

const onChangeSizes = () => {
  select.disabled = true;
  for (i = select.length - 1; i > 0; i--) {
    select.options[i] = null;
  }
  stopStream();
};

wMax.addEventListener('change', onChangeSizes);
wIdeal.addEventListener('change', onChangeSizes);
wMin.addEventListener('change', onChangeSizes);
hMax.addEventListener('change', onChangeSizes);
hIdeal.addEventListener('change', onChangeSizes);
hMin.addEventListener('change', onChangeSizes);

const setFields = (resolution) => {
  const vars = getCameraResolution(resolution);

  onChangeSizes();

  wMin.value = vars[0];
  wIdeal.value = vars[1];
  wMax.value = vars[2];
  hMin.value = vars[3];
  hIdeal.value = vars[4];
  hMax.value = vars[5];
};

setFields(1080);
