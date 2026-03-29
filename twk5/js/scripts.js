var documentData = undefined;
let livenessCheckImageBase64Data = undefined;
function testError(element) {
  let v = error;
}

function testOpenUrl(element) {
  let urlType = Number(document.getElementById("urlType").value);
  let url = document.getElementById("urlString").value;
  TWK.openUrl(url, urlType).then((ret) => {
    if (ret.success === true) {
      document.getElementById("openUrlResponseLabel").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("openUrlResponseLabel").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function getVehicleInsurance(element) {
  let vehicleSerialNumber = document.getElementById("vehicleSerialNumber").value;
 
  TWK.getUserVehicleInsurance(vehicleSerialNumber).then((ret) => {
    if (ret.success === true) {
      document.getElementById("vehicleInsuranceResultDev").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("vehicleInsuranceResultDev").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}
function sendPaymentData(element) {
  let paymentAmount = Number(document.getElementById("paymentAmount").value);
  let currencyCode = document.getElementById("currencyCode").value;

  TWK.sendPaymentData(paymentAmount, currencyCode).then((ret) => {
    if (ret.success === true) {
      document.getElementById("sendPaymentDataResultDiv").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("sendPaymentDataResultDiv").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function getUserProfilePhoto(element) {
     TWK.getUserProfilePhoto().then((userProfilePhotoResponse) => {
       if (userProfilePhotoResponse.success === true) {
         TWK.getRawData(userProfilePhotoResponse.result.data).then(
           (rawDataResponse) => {
             const imageEl = document.createElement("img");
             imageEl.src =
               "data:image/png;base64," + rawDataResponse.result.data;
             document.getElementById(
               "getUserProfilePhotoResultDev"
             ).innerHTML = "";
             document
               .getElementById("getUserProfilePhotoResultDev")
               .appendChild(imageEl);
           }
         );
       } else {
         document.getElementById("imageV2Div").innerHTML =
        "fail: " + JSON.stringify(userProfilePhotoResponse.result, null, 2);
       }
     });
}

function getUserProfilePhotoV2(element) {
     TWK.getPlainUserProfilePhoto().then((userProfilePhotoResponse) => {
       if (userProfilePhotoResponse.success === true) {
         TWK.getRawData(userProfilePhotoResponse.result.data).then(
           (rawDataResponse) => {
             const imageEl = document.createElement("img");
             imageEl.src =
               "data:image/png;base64," + rawDataResponse.result.data;
             document.getElementById(
               "getUserProfilePhotoV2ResultDev"
             ).innerHTML = "";
             document
               .getElementById("getUserProfilePhotoV2ResultDev")
               .appendChild(imageEl);
           }
         );
       } else {
         document.getElementById("imageV2Div").innerHTML =
        "fail: " + JSON.stringify(userProfilePhotoResponse.result, null, 2);
       }
     });
}

function getImageV2(element) {
  let nationalId = Number(document.getElementById("nationalIdV2").value);

  TWK.getPlainImage(nationalId).then((getImageResponse) => {
    if (getImageResponse.success === true) {
      TWK.getRawData(getImageResponse.result.data).then((rawDataResponse) => {
        const imageEl = document.createElement("img");
        imageEl.src = "data:image/png;base64," + rawDataResponse.result.data;
        imageEl.classList.add("selectedImage");
        document.getElementById("imageV2Div").innerHTML = "";
        document.getElementById("imageV2Div").appendChild(imageEl);
      });
    } else {
      document.getElementById("imageV2Div").innerHTML =
        "fail: " + JSON.stringify(getImageResponse.result, null, 2);
    }
  });
}

function testApiLogAsync(element) {
  let url = document.getElementById("apiUrl").value;
  let requestBody = document.getElementById("requestBody").value;
  let requestHeaders = document.getElementById("requestHeaders").value;
  let responseBody = document.getElementById("responseBody").value;
  let responseHeaders = document.getElementById("responseHeaders").value;
  let responseCode = Number(document.getElementById("responseCode").value);
  let methodType = Number(document.getElementById("methodType").value);
  let requestDate = new Date(document.getElementById("requestDate").value);
  let responseDate = new Date(document.getElementById("responseDate").value);
  setTimeout(() => {
    TWK.apiLog(
      url,
      methodType,
      requestBody,
      requestHeaders,
      requestDate,
      responseBody,
      responseHeaders,
      responseDate,
      responseCode
    );
  }, 400);
}

function testAPI(element) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=CAIRO&units=metric&appid=108dd9a67c96f23039937fe6f3c91963`
  )
    .then((response) => response.json())
    .then()
    .catch((err) => alert("Wrong City name"));
}

function testApiLog(element) {
  let url = document.getElementById("apiUrl").value;
  let requestBody = document.getElementById("requestBody").value;
  let requestHeaders = document.getElementById("requestHeaders").value;
  let responseBody = document.getElementById("responseBody").value;
  let responseHeaders = document.getElementById("responseHeaders").value;
  let responseCode = Number(document.getElementById("responseCode").value);
  let methodType = Number(document.getElementById("methodType").value);
  let requestDate = new Date(document.getElementById("requestDate").value);
  let responseDate = new Date(document.getElementById("responseDate").value);

  TWK.apiLog(
    url,
    methodType,
    requestBody,
    requestHeaders,
    requestDate,
    responseBody,
    responseHeaders,
    responseDate,
    responseCode
  ).then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      document.getElementById("apiLogResponseLabel").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("apiLogResponseLabel").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testGeneralLog(element) {
  TWK.generateToken().then((response) => {
    if (response.success) {
      let tokenValue = JSON.parse(
        JSON.stringify(response.result, null, 2)
      ).token;
      // or you can use this also
      let token = response.result.token;
    } else {
      // handle errors here like you will receive response like this {"code": 1000006, "status" : "401"} for service permission not added to the portal
    }
  });

  let eventName = document.getElementById("eventName").value;
  let logType = Number(document.getElementById("logType").value);
  let logMessage = document.getElementById("logMessage").value;
  TWK.generalLog(eventName, logType, logMessage).then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      document.getElementById("generalLogResponseLabel").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("generalLogResponseLabel").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testGeneralLogAsync(element) {
  let eventName = document.getElementById("eventName").value;
  let logType = Number(document.getElementById("logType").value);
  let logMessage = document.getElementById("logMessage").value;
  setTimeout(() => {
    TWK.generalLog(eventName, logType, logMessage).then((ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        document.getElementById("generalLogResponseLabel").textContent =
          "ok: " + JSON.stringify(ret.result, null, 2);
      } else {
        document.getElementById("generalLogResponseLabel").textContent =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    });
  }, 400);
}

function testDeleteDocument(element) {
  let referenceNumber = document.getElementById(
    "deleteDocumentReferenceNumber"
  ).value;
  let categoryId = document.getElementById("deleteDocumentCategoryId").value;
  TWK.deleteDocument(referenceNumber, categoryId).then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      document.getElementById("deleteDocumentsResponseLabel").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("deleteDocumentsResponseLabel").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testAddDocument(element) {
  let referenceNumber = document.getElementById("referenceNumber").value;
  let categoryId = document.getElementById("categoryId").value;
  let documentName = document.getElementById("documentName").value;

  TWK.addDocument(documentName, documentData, referenceNumber, categoryId).then(
    (ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        document.getElementById("documentsResponseLabel").textContent =
          "ok: " + JSON.stringify(ret.result, null, 2);
      } else {
        document.getElementById("documentsResponseLabel").textContent =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    }
  );
}

function testUpdateDocument(element) {
  let referenceNumber = document.getElementById("referenceNumber").value;
  let categoryId = document.getElementById("categoryId").value;
  let documentName = document.getElementById("documentName").value;
  TWK.updateDocument(
    documentName,
    documentData,
    referenceNumber,
    categoryId
  ).then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      document.getElementById("documentsResponseLabel").textContent =
        "ok: " + JSON.stringify(ret.result, null, 2);
    } else {
      document.getElementById("documentsResponseLabel").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testChooseDocumentFile(element, helperfunction) {
  helperfunction().then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      TWK.generalLog("Choose Document", LogType.info, ret.result).then(
        (ret) => {}
      );
      documentData = ret.result.data;
    } else {
      TWK.generalLog("Choose Document", LogType.error, ret.result).then(
        (ret) => {}
      );
      documentData = undefined;
      document.getElementById("documentsResponseLabel").textContent =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}
function testBaseFetch(element, helperfunction) {
  helperfunction().then((ret) => {
    if (ENABLELOG === true) {
      console.log("success " + ret.success);
    }

    // find the result box inside the same parent
    const resultBox = element.parentElement.querySelector(".result-box");

    if (ret.success) {
      TWK.generalLog("Base Fetch", LogType.info, ret.result).then(() => {});
      if (resultBox) {
        resultBox.textContent = "ok: " + JSON.stringify(ret.result, null, 2);
      }
    } else {
      TWK.generalLog("Base Fetch", LogType.error, ret.result).then(() => {});
      if (resultBox) {
        resultBox.textContent = "fail: " + JSON.stringify(ret.result, null, 2);
      }
    }
  });
}

function testGalleryFetch(element, helperfunction) {
  helperfunction().then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      TWK.generalLog("Gallery Fetch", LogType.debug, ret.result).then(
        (ret) => {}
      );

      element.nextElementSibling.innerHTML = "";
      var imageContent = "";
      for (entry in ret.result) {
        var ent = ret.result[entry];
        if (ent.type == "video") {
          TWK.getRawData(ent.data).then((ret) => {
            const videoEl = document.createElement("video");
            videoEl.src = "data:video/mp4;base64," + ret.result.data;
            videoEl.controls = true;
            videoEl.classList.add("selectedImage");
            element.nextElementSibling.appendChild(videoEl);
            let accordion = document.getElementById("camera_accordion");
            relaodAccordion(accordion)
          });
        } else if (ent.type == "image") {
          TWK.getRawData(ent.data).then((ret) => {
            const imageEl = document.createElement("img");
            imageEl.src = "data:image/png;base64," + ret.result.data;
            imageEl.classList.add("selectedImage");
            element.nextElementSibling.appendChild(imageEl);
            let accordion = document.getElementById("gallery_accordion");
            relaodAccordion(accordion)
          });
        } else {
          const divEl = document.createElement("div");
          divEl.innerText = "file data length " + ent.data.length;
          divEl.classList.add("selectedImage");
          element.nextElementSibling.appendChild(divEl);
        }
      }
    } else {
      TWK.generalLog("Gallery Fetch", LogType.error, ret.result).then(
        (ret) => {}
      );
      element.nextElementSibling.innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}
function testUserPhoto(element, helperfunction) {
  helperfunction().then((ret) => {
    element.nextElementSibling.innerHTML = "";
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      TWK.generalLog("user photo", LogType.info, ret.result).then((ret) => {});

      var imageContent = "";
      TWK.getRawData(ret.result.data).then((ret) => {
        TWK.generalLog("user photo raw data", LogType.debug, ret.result).then(
          (ret) => {}
        );

        const imageEl = document.createElement("img");
        imageEl.src = "data:image/png;base64," + ret.result.data;
        imageEl.classList.add("selectedImage");
        element.nextElementSibling.appendChild(imageEl);
      });
    } else {
      TWK.generalLog("user photo", LogType.error, ret.result).then((ret) => {});
      element.nextElementSibling.innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}
function testGetImage(element) {
  let nationalId = document.getElementById("nationalId").value;
  try {
    if ((isNaN(nationalId), Number(nationalId))) {
      TWK.getImage(Number(nationalId)).then((ret) => {
        document.getElementById("imageDive").innerHTML = "";
        if (ENABLELOG == true) {
          console.log("success " + ret.success);
        }
        if (ret.success) {
          var imageContent = "";
          TWK.getRawData(ret.result.data).then((ret) => {
            const imageEl = document.createElement("img");
            imageEl.src = "data:image/png;base64," + ret.result.data;
            imageEl.classList.add("selectedImage");
            document.getElementById("imageDive").appendChild(imageEl);
          });
        } else {
          document.getElementById("imageDive").innerHTML =
            "fail: " + JSON.stringify(ret.result, null, 2);
        }
      });
    } else {
      document.getElementById("imageDive").innerHTML =
        "fail: Invalid National Id please enter numbers only";
    }
  } catch {
    document.getElementById("imageDive").innerHTML =
      "fail: Invalid National Id please enter numbers only";
  }
}
function testChooseFile(element, helperfunction) {
  helperfunction().then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    element.nextElementSibling.innerHTML = "";
    if (ret.success) {
      TWK.generalLog("choose file", LogType.debug, ret.result).then(
        (ret) => {}
      );
      element.nextElementSibling.innerHTML = " " + ret.result.data;
    } else {
      TWK.generalLog("choose file", LogType.error, ret.result).then(
        (ret) => {}
      );
      element.nextElementSibling.innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testCameraPhoto(element, helperfunction) {
  helperfunction().then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    element.nextElementSibling.innerHTML = "";
    if (ret.success) {
      TWK.generalLog("camera photo", LogType.debug, ret.result).then(
        (ret) => {}
      );

      if (ret.result.type == "image") {
        TWK.getRawData(ret.result.data).then((ret) => {
          const imageEl = document.createElement("img");
          imageEl.src = "data:image/png;base64," + ret.result.data;
          imageEl.classList.add("selectedImage");
          element.nextElementSibling.appendChild(imageEl);
        });
      }
    } else {
      TWK.generalLog("camera photo", LogType.warning, ret.result).then(
        (ret) => {}
      );
      element.nextElementSibling.innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testCameraVideo(element, helperfunction) {
  helperfunction().then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      TWK.generalLog("camera video", LogType.debug, ret.result).then(
        (ret) => {}
      );

      element.nextElementSibling.innerHTML = "";
      TWK.getRawData(ret.result.data).then((ret) => {
        const videoEl = document.createElement("video");
        videoEl.src = "data:video/mp4;base64," + ret.result.data;
        videoEl.controls = true;
        videoEl.classList.add("selectedImage");
        element.nextElementSibling.appendChild(videoEl);
      });
    } else {
      TWK.generalLog("camera video", LogType.error, ret.result).then(
        (ret) => {}
      );
      element.nextElementSibling.innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testShareSubmit(element) {
  try {
    fileToBase64(file).then((ret) => {
      TWK.share(ret, file.type).then((ret) => {
        if (ENABLELOG == true) {
          console.log("success " + ret.success);
        }
        if (ret.success) {
          TWK.generalLog("share", LogType.debug, ret.result).then((ret) => {});
          document.getElementById("shareResponseLabel").innerHTML =
            "" + JSON.stringify(ret.result);
        } else {
          TWK.generalLog("share", LogType.warning, ret.result).then(
            (ret) => {}
          );
          document.getElementById("shareResponseLabel").innerHTML =
            "fail: " + JSON.stringify(ret.result, null, 2);
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function testSharePdfSubmit(element) {
  try {
    var fileName = document.getElementById("shareFileName").value;
    const pdfFile = new File(["Hello world!"], "hello.pdf", {
      type: "application/pdf",
    });
    fileToBase64(pdfFile).then((ret) => {
      TWK.share(fileName, ret, pdfFile.type).then((ret) => {
        if (ENABLELOG == true) {
          console.log("success " + ret.success);
        }
        if (ret.success) {
          TWK.generalLog("share pdf", LogType.debug, ret.result).then(
            (ret) => {}
          );

          document.getElementById("sharePdfResponseLabel").innerHTML =
            "" + JSON.stringify(ret.result);
        } else {
          TWK.generalLog("share pdf", LogType.warning, ret.result).then(
            (ret) => {}
          );
          document.getElementById("sharePdfResponseLabel").innerHTML =
            "fail: " + JSON.stringify(ret.result, null, 2);
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function testSharePngSubmit(element) {
  try {
    var fileName = document.getElementById("shareFileName").value;

    TWK.share(fileName, pngBase64, "image/png").then((ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        TWK.generalLog("share png", LogType.info, ret.result).then((ret) => {});

        document.getElementById("sharePdfResponseLabel").innerHTML =
          "" + JSON.stringify(ret.result);
      } else {
        TWK.generalLog("share png", LogType.warning, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
function testShareJpgSubmit(element) {
  try {
    var fileName = document.getElementById("shareFileName").value;
    TWK.share(fileName, jpgBase64, "image/jpeg").then((ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        TWK.generalLog("share jpg", LogType.debug, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "" + JSON.stringify(ret.result);
      } else {
        TWK.generalLog("share jpg", LogType.error, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
function convertStringToBase64(str) {
  // Encode the string as a UTF-8 byte array
  const utf8Encoder = new TextEncoder();
  const utf8Bytes = utf8Encoder.encode(str);
  // Convert the byte array to Base64
  const base64String = btoa(String.fromCharCode.apply(null, utf8Bytes));
  return base64String;
}

function testShareTextStringSubmit(element) {
  try {
    var textString = document.getElementById("shareText").value;
    var fileName = document.getElementById("shareFileName").value;
    var stringBase64 = convertStringToBase64(textString);
    TWK.share(fileName, stringBase64, "text/plain").then((ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        TWK.generalLog("share text", LogType.debug, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "" + JSON.stringify(ret.result);
      } else {
        TWK.generalLog("share text", LogType.warning, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
function testShareNotSupportedSubmit(element) {
  try {
    var fileName = document.getElementById("shareFileName").value;

    const txtFile = new File(["Hello world!"], "hello.html", {
      type: "text/html",
    });
    fileToBase64(txtFile).then((ret) => {
      TWK.share(fileName, ret, txtFile.type).then((ret) => {
        if (ENABLELOG == true) {
          console.log("success " + ret.success);
        }
        if (ret.success) {
          document.getElementById("sharePdfResponseLabel").innerHTML =
            "" + JSON.stringify(ret.result);
        } else {
          document.getElementById("sharePdfResponseLabel").innerHTML =
            "fail: " + JSON.stringify(ret.result, null, 2);
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
function testCardSubmit(element) {
  var cardAttributes = [
    {
      key: "JobTitleAr",
      value: document.getElementById("jobTitleAr").value,
    },
    {
      key: "JobTitleEn",
      value: document.getElementById("jobTitleEn").value,
    },
    {
      key: "EmployeeNo",
      value: document.getElementById("employeeNo").value,
    },
    {
      key: "ExpirationDateEn",
      value: document.getElementById("expiryDateEn").value,
    },
    {
      key: "ExpirationDateAr",
      value: document.getElementById("expiryDateAr").value,
    },
  ];

  var payload = {
    agencyId: new Number(document.getElementById("agencyId").value),
    uniqueCardId: new Number(document.getElementById("uniqueCardId").value),
    referenceNo: document.getElementById("cardReferenceNo").value,
    expirationDate: document.getElementById("cardExpiryDate").value,
    cardAttributes: cardAttributes,
  };

  var actionType = new Number(document.getElementById("actionType").value);

  TWK.postCard(actionType, payload).then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      document.getElementById("addCardResponseLabel").innerHTML =
        "" + JSON.stringify(ret.result);
    } else {
      document.getElementById("addCardResponseLabel").innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testOpenService(element) {
  var serviceId = document.getElementById("serviceId").value;
  var serviceParams = document.getElementById("serviceParms").value;
  try {
    let parameterArray = [];

    if (serviceParams.length > 0) {
      let obj = eval("(" + serviceParams + ")");
      for (let i in obj) {
        parameterArray.push(obj[i]);
      }
    }

    TWK.openService(serviceId, parameterArray).then((ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        document.getElementById("openServiceResponseLabel").innerHTML =
          "" + JSON.stringify(ret.result);
      } else {
        document.getElementById("openServiceResponseLabel").innerHTML =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    });
  } catch (error) {
    document.getElementById("openServiceResponseLabel").innerHTML =
      "fail: Error stringifying object for service paramaters: ";
  }
}

function testOpenScreen(element) {
  var parameterArray = [];
  var screenType = document.getElementById("screenType").value;
  var keyName = document.getElementById("keyname").value;
  var keyValue = document.getElementById("valuename").value;

  parameterArray.push({ key: keyName, value: keyValue });

  TWK.openScreen(screenType, parameterArray).then((ret) => {
    if (ENABLELOG == true) {
      console.log("success " + ret.success);
    }
    if (ret.success) {
      TWK.generalLog("open screen", LogType.info, ret.result).then((ret) => {});
      element.nextElementSibling.innerHTML = "" + JSON.stringify(ret.result);
    } else {
      TWK.generalLog("open screen", LogType.warning, ret.result).then(
        (ret) => {}
      );
      element.nextElementSibling.innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function handleAccordion() {
  let acc = document.getElementsByClassName("accordion");
  let i;
  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }
}
function testOnline(element) {
  if (navigator.onLine) {
    console.log("Online")
  } else {
        console.log("Offline")
  }
}
function relaodAccordion(accordion) {
  setTimeout(function () {
    accordion.classList.toggle("active");
    let panel = accordion.nextElementSibling;
    panel.style.maxHeight = panel.scrollHeight + "px";
  }, 0);
}

document.addEventListener("DOMContentLoaded", function () {
  if (navigator.onLine) {
    console.log("Online")
  } else {
        console.log("Offline")
  }
  // TWK.startApiIntercept()


  if (ENABLELOG == true) {
    console.log("DOM fully loaded and parsed " + LAUNCHPAYLOAD);
  }
  const elem = document.getElementById("launchPayload");
  elem.innerText = "" + LAUNCHPAYLOAD;
  const fileInput = document.getElementById("fileInput");

  document.getElementById("localStorage").innerText =
    JSON.stringify(localStorage);
  let style = document.createElement("style");
  style.innerHTML =
    "input,select:focus, textarea {font-size: 16px !important;}";
  document.head.appendChild(style);
});
function testSetLocalStorage(element) {
  var key = document.getElementById("localStorageKey").value;
  var value = document.getElementById("localStorageValue").value;
  localStorage.setItem(key, value);
  // const entries = Object.entries(localStorage)
  document.getElementById("localStorage").innerText =
    JSON.stringify(localStorage);
}
function testGetLocalStorage(element) {
  var key = document.getElementById("localStorageGetKey").value;
  document.getElementById("localStoragekeyValue").innerText =
    localStorage.getItem(key);
}

function testPayment(element) {
  let paymentUrl = document.getElementById("paymentUrl").value;
  let successCallbackUrl = document.getElementById(
    "paymenSuccessCallback"
  ).value;
  let failureCallbackUrl = document.getElementById(
    "paymenFailureCallback"
  ).value;
  let successCallbackUrlList = successCallbackUrl
    .split(",")
    .map((item) => item.trim());
  let failureCallbackUrlList = failureCallbackUrl
    .split(",")
    .map((item) => item.trim());
  TWK.setPaymentConfiguration(
    successCallbackUrlList,
    failureCallbackUrlList,
    "successPayment.html",
    "failurePayment.html"
  );

  setTimeout(function () {
    window.location.replace(paymentUrl);
  }, 2000);
}

function testChooseFileAndGetFileName(element) {
  TWK.getFileId().then((ret) => {
    console.log("success " + ret.success);
   document.getElementById("testChooseFileAndGetFileNameResult").value = "";
    let decodedFileName = "";
    if (ret.success) {
      //here you will get the file name in the [result.data] for the chooosen file
      let fileName = ret.result.file_name;

      // from the mime type you can detect the type of the file and load the
      let mimeType = ret.result.mime_type;
      TWK.getRawData(ret.result.data).then((response) => {
        if (response.success) {
          let fileBase64Data = response.result.data;
          document.getElementById("testChooseFileAndGetFileNameResult").value =
            "file name: " +
            fileName +
            "<br> mime Type: " +
            mimeType +
            "<br>Data:<br>" +
            fileBase64Data;
        } else {
          document.getElementById("testChooseFileAndGetFileNameResult").value =
            "fail: " + JSON.stringify(ret.result, null, 2);
        }
      });
    } else {
     document.getElementById("testChooseFileAndGetFileNameResult").value =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}
function testLivenessCheckCamera(element) {
  let configurations = [];
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_DETECTION_ENABLED,
      document.getElementById("face_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_DETECTION_RATIO,
      document.getElementById("face_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.GLASSES_DETECTION_ENABLED,
      document.getElementById("glasses_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.GLASSES_DETECTION_RATIO,
      document.getElementById("glasses_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_CENTRAL_VERTICAL_ENABLED,
      document.getElementById("face_centeral_vertical_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_CENTRAL_VERTICAL_RATIO,
      document.getElementById("face_centeral_vertical_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MOUTH_DETECTION_ENABLED,
      document.getElementById("mouth_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MOUTH_DETECTION_RATIO,
      document.getElementById("mouth_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_COLOR_DETECTION_ENABLED,
      document.getElementById("eyes_color_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_COLOR_DETECTION_RATIO,
      document.getElementById("eyes_color_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.LIGHTNING_DETECTION_ENABLED,
      document.getElementById("lightining_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.LIGHTNING_DETECTION_RATIO,
      document.getElementById("lightining_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_DETECTION_ENABLED,
      document.getElementById("eyes_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_DETECTION_RATIO,
      document.getElementById("eyes_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.BACKGROUND_DETECTION_ENABLED,
      document.getElementById("background_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.BACKGROUND_DETECTION_RATIO,
      document.getElementById("background_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.HEAD_WEAR_CHECK_ENABLED,
      document.getElementById("head_wear_check_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.ALLOWED_PHOTO_TYPES,
      document.getElementById("allowd_image_types").value || "jpg,jpeg"
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.IS_FEMALE,
      document.getElementById("is_female").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.PHOTO_WIDTH_IN_PX,
      document.getElementById("max_photo_width_in_px").value || 450
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.PHOTO_HEIGHT_IN_PX,
      document.getElementById("max_photo_height_in_px").value || 450
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MAX_PHOTO_SIZE_IN_KB,
      document.getElementById("max_photo_size_kb").value || 5000
    )
  );

  TWK.livenessCheckCamera(configurations).then((ret) => {
    if (ret.success) {
      livenessCheckImageBase64Data = ret.result.data;
      document.getElementById("livenessCheckDev").innerHTML = "";
      const div = document.createElement("div");
      div.innerHTML = `file name: ${ret.result.file_name} <br> mime type: ${ret.result.mime_type}`;
      const imageEl = document.createElement("img");
      imageEl.src = "data:image/png;base64," + livenessCheckImageBase64Data;
      imageEl.classList.add("selectedImage");
      const newButton = document.createElement("button");
      newButton.addEventListener("click", testShareLivenessCheckImage);
      newButton.textContent = "Share image";
      document.getElementById("livenessCheckDev").appendChild(imageEl);
      document.getElementById("livenessCheckDev").appendChild(div);
      document.getElementById("livenessCheckDev").appendChild(newButton);
    } else {
      document.getElementById("livenessCheckDev").innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testLivenessCheckImageFromGallery(element) {
  let configurations = [];
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_DETECTION_ENABLED,
      document.getElementById("face_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_DETECTION_RATIO,
      document.getElementById("face_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.GLASSES_DETECTION_ENABLED,
      document.getElementById("glasses_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.GLASSES_DETECTION_RATIO,
      document.getElementById("glasses_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_CENTRAL_VERTICAL_ENABLED,
      document.getElementById("face_centeral_vertical_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_CENTRAL_VERTICAL_RATIO,
      document.getElementById("face_centeral_vertical_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MOUTH_DETECTION_ENABLED,
      document.getElementById("mouth_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MOUTH_DETECTION_RATIO,
      document.getElementById("mouth_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_COLOR_DETECTION_ENABLED,
      document.getElementById("eyes_color_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_COLOR_DETECTION_RATIO,
      document.getElementById("eyes_color_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.LIGHTNING_DETECTION_ENABLED,
      document.getElementById("lightining_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.LIGHTNING_DETECTION_RATIO,
      document.getElementById("lightining_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_DETECTION_ENABLED,
      document.getElementById("eyes_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_DETECTION_RATIO,
      document.getElementById("eyes_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.BACKGROUND_DETECTION_ENABLED,
      document.getElementById("background_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.BACKGROUND_DETECTION_RATIO,
      document.getElementById("background_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.HEAD_WEAR_CHECK_ENABLED,
      document.getElementById("head_wear_check_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.ALLOWED_PHOTO_TYPES,
      document.getElementById("allowd_image_types").value || "jpg,jpeg"
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.IS_FEMALE,
      document.getElementById("is_female").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.PHOTO_WIDTH_IN_PX,
      document.getElementById("max_photo_width_in_px").value || 450
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.PHOTO_HEIGHT_IN_PX,
      document.getElementById("max_photo_height_in_px").value || 450
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MAX_PHOTO_SIZE_IN_KB,
      document.getElementById("max_photo_size_kb").value || 5000
    )
  );

  TWK.livenessCheckImageFromGallery(configurations).then((ret) => {
    if (ret.success) {
      livenessCheckImageBase64Data = ret.result.data;
      document.getElementById("livenessCheckDev").innerHTML = "";
      const div = document.createElement("div");
      div.innerHTML = `file name: ${ret.result.file_name} <br> mime type: ${ret.result.mime_type}`;
      const imageEl = document.createElement("img");
      imageEl.src = "data:image/png;base64," + livenessCheckImageBase64Data;
      imageEl.classList.add("selectedImage");
      const newButton = document.createElement("button");
      newButton.addEventListener("click", testShareLivenessCheckImage);
      newButton.textContent = "Share image";
      document.getElementById("livenessCheckDev").appendChild(imageEl);
      document.getElementById("livenessCheckDev").appendChild(div);
      document.getElementById("livenessCheckDev").appendChild(newButton);
    } else {
      document.getElementById("livenessCheckDev").innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testLivenessCheckImageFromFiles(element) {
  let configurations = [];
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_DETECTION_ENABLED,
      document.getElementById("face_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_DETECTION_RATIO,
      document.getElementById("face_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.GLASSES_DETECTION_ENABLED,
      document.getElementById("glasses_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.GLASSES_DETECTION_RATIO,
      document.getElementById("glasses_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_CENTRAL_VERTICAL_ENABLED,
      document.getElementById("face_centeral_vertical_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.FACE_CENTRAL_VERTICAL_RATIO,
      document.getElementById("face_centeral_vertical_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MOUTH_DETECTION_ENABLED,
      document.getElementById("mouth_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MOUTH_DETECTION_RATIO,
      document.getElementById("mouth_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_COLOR_DETECTION_ENABLED,
      document.getElementById("eyes_color_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_COLOR_DETECTION_RATIO,
      document.getElementById("eyes_color_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.LIGHTNING_DETECTION_ENABLED,
      document.getElementById("lightining_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.LIGHTNING_DETECTION_RATIO,
      document.getElementById("lightining_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_DETECTION_ENABLED,
      document.getElementById("eyes_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.EYES_DETECTION_RATIO,
      document.getElementById("eyes_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.BACKGROUND_DETECTION_ENABLED,
      document.getElementById("background_detection_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.BACKGROUND_DETECTION_RATIO,
      document.getElementById("background_detection_ratio").value || 50
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.HEAD_WEAR_CHECK_ENABLED,
      document.getElementById("head_wear_check_enabled").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.ALLOWED_PHOTO_TYPES,
      document.getElementById("allowd_image_types").value || "jpg,jpeg"
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.IS_FEMALE,
      document.getElementById("is_female").checked || false
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.PHOTO_WIDTH_IN_PX,
      document.getElementById("max_photo_width_in_px").value || 450
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.PHOTO_HEIGHT_IN_PX,
      document.getElementById("max_photo_height_in_px").value || 450
    )
  );
  configurations.push(
    new LivenessCheckConfiguration(
      LivenessCheckConfigurationType.MAX_PHOTO_SIZE_IN_KB,
      document.getElementById("max_photo_size_kb").value || 5000
    )
  );

  TWK.livenessCheckImageFromFiles(configurations).then((ret) => {
    if (ret.success) {
      livenessCheckImageBase64Data = ret.result.data;
      document.getElementById("livenessCheckDev").innerHTML = "";
      const div = document.createElement("div");
      div.innerHTML = `file name: ${ret.result.file_name} <br> mime type: ${ret.result.mime_type}`;
      const imageEl = document.createElement("img");
      imageEl.src = "data:image/png;base64," + livenessCheckImageBase64Data;
      imageEl.classList.add("selectedImage");
      const newButton = document.createElement("button");
      newButton.addEventListener("click", testShareLivenessCheckImage);
      newButton.textContent = "Share image";
      document.getElementById("livenessCheckDev").appendChild(imageEl);
      document.getElementById("livenessCheckDev").appendChild(div);
      document.getElementById("livenessCheckDev").appendChild(newButton);
    } else {
      document.getElementById("livenessCheckDev").innerHTML =
        "fail: " + JSON.stringify(ret.result, null, 2);
    }
  });
}

function testShareLivenessCheckImage(element) {
  try {
    TWK.share(
      "liveness_check_photo",
      livenessCheckImageBase64Data,
      "image/jpeg"
    ).then((ret) => {
      if (ENABLELOG == true) {
        console.log("success " + ret.success);
      }
      if (ret.success) {
        TWK.generalLog("share jpeg", LogType.debug, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "" + JSON.stringify(ret.result);
      } else {
        TWK.generalLog("share jepg", LogType.error, ret.result).then(
          (ret) => {}
        );
        document.getElementById("sharePdfResponseLabel").innerHTML =
          "fail: " + JSON.stringify(ret.result, null, 2);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function scanQR(element) {
  TWK.scanCode().then((response) => {
    if (response.success) {
    let code = response.result.value;
     document.getElementById("eventQr").value = code
    }
  });
}

function addCalendarEvent(element) {
  let eventTitle = document.getElementById("eventTitle").value;
  let eventStartDateTime = document.getElementById("eventStartDateTime").value;
  let eventEndDateTime = document.getElementById("eventEndDateTime").value;
  let eventRecurringType = Number(document.getElementById("eventRecurringType").value);
  let eventReminderType = Number(document.getElementById("eventReminderType").value);
  let eventReminderBeforeType = Number(document.getElementById("eventReminderBeforeType").value);
  let eventLocationLatitude = Number(document.getElementById("eventLatitude").value);
  let eventLocationLongitude = Number(document.getElementById("eventLongitude").value);
  let eventQr = document.getElementById("eventQr").value;
  let eventDescription = document.getElementById("eventDescription").value;
  
  TWK.addCalendarEvent(eventTitle, eventStartDateTime, eventEndDateTime, eventRecurringType, eventReminderType, eventReminderBeforeType, eventLocationLatitude, eventLocationLongitude, eventQr, eventDescription)
  .then((response) => {
    if (response.success) {
       document.getElementById("addCalendarEventResponseLabel").innerHTML =
          "" + JSON.stringify(response.result);
    } else {
       document.getElementById("addCalendarEventResponseLabel").innerHTML =
          "fail: " + JSON.stringify(response.result, null, 2);
    }
  });
}

function testChooseFileBase64(element) {
  TWK.getFileBase64().then((response) => {
    if (response.success) {
       document.getElementById("fileBase64Result").value =
          "" + JSON.stringify(response.result);
    } else {
       document.getElementById("fileBase64Result").value =
          "fail: " + JSON.stringify(response.result, null, 2);
    }
  });
}