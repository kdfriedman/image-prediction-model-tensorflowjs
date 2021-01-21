// validate file upload or drag onDrop
const hasValidFile = (file, eventTarget, updateErrorState) => {
  // store file pathname
  const fileName = eventTarget.value;
  const fileTypeDotIndexPosition = fileName.lastIndexOf(".") + 1;
  const slicedFileTypeFromFilePath = fileName.slice(fileTypeDotIndexPosition);

  // image validation regex

  const hasImageFile = /((image)\/(png|jpg|jpeg|webp))/i;
  const hasInvalidFileType = !hasImageFile.test(file.type);
  const hasInvalidFilePath = !hasImageFile.test(
    `image/${slicedFileTypeFromFilePath}`
  );

  // prettier-ignore
  if (hasInvalidFileType || hasInvalidFilePath) {
      updateErrorState('errFileType');
      return false;
  }
  return file;
};

// wrap FileReader api in promise to handle as async operation. FileReader does not return promise natively.
const readURL = file => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    const img = new Image();
    fileReader.onload = e => {
      img.src = fileReader.result;
      img.onload = evt => {
        return resolve(e.target.result);
      };
    };
    fileReader.onerror = e => reject(e);
    // convert to base64 string
    fileReader.readAsDataURL(file);
  });
};

export { hasValidFile, readURL };
