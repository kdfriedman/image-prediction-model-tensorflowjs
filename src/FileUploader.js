import React, { useState, useRef, useEffect } from "react";
import { ImImage } from "react-icons/im";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import getImagePrediction from "./image-predicter";
import { hasValidFile, readURL } from "./utility/utility";

const FileUploader = () => {
  // set state for image file
  const [currentImage, setImage] = useState(null);
  // set state for image base64 string to pass in as src of <img> tag
  const [fileToBase64, updateBase64] = useState(null);
  // set state for tensorflow model prediction imagePredictionResults
  const [imagePredictionResults, setImagePredictionResults] = useState(null);
  // set state for file upload errors
  const [uploadError, updateErrorState] = useState(null);
  // set state for async data fetching/loading
  const [isLoading, updateLoadingState] = useState(false);
  // set ref for file input element
  const imageInputRef = useRef();

  // return jsx with error message when failed file upload occurs
  const handleInvalidFileUpload = err => {
    const errMessageMap = new Map();
    errMessageMap.set(
      "errFileType",
      "Invalid file upload. Please upload image files only."
    );
    errMessageMap.set(
      "errFileArrayLength",
      "Invalid file upload. Please upload one file at a time"
    );
    return (
      <div className="file-uploader__file-upload-error">
        {errMessageMap.get(err)}
      </div>
    );
  };

  // handle drag over event
  const handleDragOver = e => {
    e.preventDefault();
    const uploadImageModule = e.target.closest("label");
    if (!uploadImageModule) return;
    uploadImageModule.style.backgroundColor = "rgb(0 0 0 / 22%)";
  };

  // handle drop event
  const handleDrop = e => {
    e.preventDefault();
    // reset error state
    updateErrorState(null);

    // clear last prediction results prediction results
    setImagePredictionResults(null);

    // return all non-label-element event targets
    const uploadImageModule = e.target.closest("label");
    if (!uploadImageModule) return;

    // reset dropzone background to transparent
    uploadImageModule.style.backgroundColor = "rgb(255 255 255 / 0%)";

    // look through label element children to locate input element child
    const eventTargetChildFileInput = [...uploadImageModule.children].filter(
      child => child.id === "fileUploaderInput"
    );

    // manually set input from, check if drag api file list is undefined/null, pass in empty object if null/undefined.
    eventTargetChildFileInput[0].files = e.dataTransfer.files || null;

    // validate if more than 1 image is dropped, return and clear upload if file length is greater than 1 image
    if (
      eventTargetChildFileInput[0].files.length > 1 ||
      eventTargetChildFileInput[0].files.length === 0
    ) {
      handleRemoveImage();
      return updateErrorState("errFileArrayLength");
    }

    // validate dropped file
    const file = hasValidFile(
      e.dataTransfer.files[0],
      eventTargetChildFileInput[0],
      updateErrorState
    );

    // validate uploaded file
    if (!file) {
      // handle edge cause which occurs when valid image is present and invalid is dropped
      return handleRemoveImage();
    }

    // set image state with uploaded image file
    setImage(file);

    // async wrapper to handle async readURL function
    (async () => {
      // read file
      const url = await readURL(file);
      const uploadImageLabelElement = document.getElementById(
        "uploadImageModule"
      );
      // update state with new image base64 string
      updateBase64(url);

      // add class to label element to change cursor styling
      uploadImageLabelElement.classList.add("image-active");
    })();
  };

  // handle drag exit
  const handleDragLeave = e => {
    e.preventDefault();

    // return all non-label-element event targets
    const uploadImageModule = e.target.closest("label");
    if (!uploadImageModule) return;

    // reset dropzone background to transparent
    uploadImageModule.style.backgroundColor = "rgb(255 255 255 / 0%)";
  };

  const handleImageFileChange = e => {
    // reset error state
    updateErrorState(null);

    // check if file has length to determine if file has been selected or canceled
    if (e.target.files.length === 0) return;

    // run validate function, then store output file in variable
    const file = hasValidFile(e.target.files[0], e.target, updateErrorState);

    // validate uploaded file
    if (!file) return;

    // set image state with uploaded image file
    setImage(file);

    // async wrapper to handle async readURL function
    (async () => {
      // read file
      const url = await readURL(file);
      const uploadImageLabelElement = document.getElementById(
        "uploadImageModule"
      );

      // update state with new image base64 string
      updateBase64(url);

      // add class to label element to change cursor styling
      uploadImageLabelElement.classList.add("image-active");
    })();
  };

  // remove image - reset all state
  const handleRemoveImage = () => {
    const uploadImageModule = document.getElementById("uploadImageModule");
    imageInputRef.current.value = "";
    setImage(null);
    updateBase64(null);
    setImagePredictionResults(null);
    uploadImageModule.classList.remove("image-active");
  };

  // run tensor flow model and wait result
  const handleRunImagePredictionModel = e => {
    // if image has been uploaded, end function execution
    if (!currentImage) return;

    // async wrapper to handle async getImagePrediction function
    (async () => {
      // update loadingState hook to render loading icon
      updateLoadingState(true);
      // retrieve new image tag to pass into tensorflow model
      const currentImgElement = document.getElementById("uploadedImage");
      const predictionResults = await getImagePrediction(currentImgElement);
      setImagePredictionResults(predictionResults);
      updateLoadingState(false);
    })();
  };

  return (
    <div className="file-uploader__container">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        id="uploadImageModule"
        className="file-uploader__upload-image-button"
      >
        {!currentImage && (
          <ImImage className="file-uploader__image-preview-icon" />
        )}

        {isLoading && (
          <>
            <div className="file-uploader__loader-container">
              <AiOutlineLoading3Quarters className="file-uploader__loader" />
            </div>
          </>
        )}

        {!currentImage && (
          <div>
            Click or drag an image file.{" "}
            <div className="file-uploader__upload-supported-types">
              (JPEG, JPG, PNG, WEBP Supported)
            </div>
          </div>
        )}

        <input
          id="fileUploaderInput"
          style={{ display: "none" }}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleImageFileChange}
          ref={imageInputRef}
          disabled={currentImage ? true : false}
        />
      </label>

      <div className="file-uploader__image-preview-container">
        {fileToBase64 && (
          <img
            className="file-uploader__image-preview"
            src={fileToBase64}
            id="uploadedImage"
          />
        )}
        {uploadError ? handleInvalidFileUpload(uploadError) : ""}
      </div>

      <button
        className="file-uploader__remove-image-button"
        disabled={!currentImage ? true : false}
        onClick={handleRemoveImage}
      >
        Remove Image
      </button>

      <button
        disabled={!currentImage ? true : false}
        className="file-uploader__analyze-image-button"
        onClick={handleRunImagePredictionModel}
      >
        Analyze Image
      </button>

      {imagePredictionResults && (
        <div className="file-uploader__prediction-result-container">
          {imagePredictionResults.map(imgPredictionResultObj => {
            const { className, probability } = imgPredictionResultObj;
            return (
              <div
                className="file-uploader__prediction-result"
                key={className}
              >{`${className} - ${Math.trunc(probability * 100)}%`}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
