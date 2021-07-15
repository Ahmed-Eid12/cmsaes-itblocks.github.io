$(document).ready(function () {
  $("input[type=file]").val("");
  $("#decrypted_file").val("");
  $("#clear").on("click", () => {
    $("#decrypt").val("");
    $("#encrypt").val("");
    $("#message").html("");
    $("#old_secret").prop("checked", true);
    $("input[type=file]").val("");
    $("#decrypted_file").val("");
  });
  $("#encrypt").on("keypress", () => {
    $("#message").html("");
  });
  $("#decrypt").on("keypress", () => {
    $("#message").html("");
  });
});

/**
 * encrypt function
 */
function encryptElement(str, keyPassed) {
  EAINFO_ED_KEY = keyPassed;
  // this is the actual key as a sequence of bytes
  try {
    var key = CryptoJS.enc.Base64.parse(EAINFO_ED_KEY);

    var strEncrypted = CryptoJS.AES.encrypt(str, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
  } catch (e) {
    if (e) {
      console.log("Error");
    }
  }
  return strEncrypted.toString();
}

/**
 * encrypt function
 */
function decryptElement(str, keyPassed) {
  EAINFO_ED_KEY = keyPassed;
  try {
    // this is the actual key as a sequence of bytes
    var key = CryptoJS.enc.Base64.parse(EAINFO_ED_KEY);
    // this is the decrypted data as a sequence of bytes
    var decryptedData = CryptoJS.AES.decrypt(str, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
  } catch (e) {
    $.post(/* send exception to server? */);
    console.log("Error" + e.message);
  }

  // this is the decrypted data as a string
  var decryptedDataStr = decryptedData.toString(CryptoJS.enc.Utf8);

  return decryptedDataStr;
}

// encrypt element ...
function toEncryptElement() {
  $("#decrypt").val("");
  $("#decrypt").removeAttr("data-clipboard-text");
  const encryptText = $("#encrypt").val();
  const keyType = $("input[name=secret]:checked").val();
  let elementEncrypted = encryptElement(encryptText, keyType);
  $("#decrypt")
    .val(elementEncrypted)
    .attr("data-clipboard-text", elementEncrypted);
}

// decrypt element ...
function toDecryptElement() {
  $("#encrypt").val("");
  const decryptText = $("#decrypt").val();
  const keyType = $("input[name=secret]:checked").val();
  let elementDecrypted = decryptElement(decryptText, keyType);
  if (elementDecrypted) {
    $("#encrypt").val(elementDecrypted);
  } else {
    $("#message").html("you try to decrypt wrong Text, try with another key.");
  }
}

function getCloneFromEncryptInput() {
  copyToClipboard(document.getElementById("encrypt"));
}

function getCloneFromDecryptInput() {
  copyToClipboard(document.getElementById("decrypt"));
}

// copy element
function copyToClipboard(elem) {
  // create hidden text element, if it doesn't already exist
  var targetId = "_hiddenCopyText_";
  var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
  var origSelectionStart, origSelectionEnd;
  if (isInput) {
    // can just use the original source element for the selection and copy
    target = elem;
    origSelectionStart = elem.selectionStart;
    origSelectionEnd = elem.selectionEnd;
  } else {
    // must use a temporary form element for the selection and copy
    target = document.getElementById(targetId);
    if (!target) {
      var target = document.createElement("textarea");
      target.style.position = "absolute";
      target.style.left = "-9999px";
      target.style.top = "0";
      target.id = targetId;
      document.body.appendChild(target);
    }
    target.textContent = elem.textContent;
  }
  // select the content
  var currentFocus = document.activeElement;
  target.focus();
  target.setSelectionRange(0, target.value.length);

  // copy the selection
  var succeed;
  try {
    succeed = document.execCommand("copy");
  } catch (e) {
    succeed = false;
  }
  // restore original focus
  if (currentFocus && typeof currentFocus.focus === "function") {
    currentFocus.focus();
  }

  if (isInput) {
    // restore prior selection
    elem.setSelectionRange(origSelectionStart, origSelectionEnd);
  } else {
    // clear temporary content
    target.textContent = "";
  }
  return succeed;
}

/**
 *
 * upload file to encrypt or decrypt
 *
 */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  function showFile() {
    // var preview = document.getElementById("show-text");
    var file = document.querySelector("input[type=file]").files[0];
    var reader = new FileReader();
    console.log(file.type);
    var textFile = /text.*/;

    if (file.type.match(textFile) || file.type === "text/plain") {
      reader.onload = function (event) {
        // preview.innerHTML = event.target.result;
        const fileText = decryptTxtFileValues(event.target.result);
        $("#decrypted_file").val(fileText);
      };
    } else {
      //  preview.innerHTML = "<span class='error'>It doesn't seem to be a text file!</span>";
      console.log("not txt file");
    }
    reader.readAsText(file);
  }
} else {
  alert("Your browser is too old to support HTML5 File API");
}

function decryptTxtFileValues(Text) {
  let splitted = Text.split("\r\n");
  const keyType = $("input[name=secret]:checked").val();
  var fileText;
  let encryptedElement;
  let elementRetrieved;
  for (let index = 0; index < splitted.length; index++) {
    if (splitted[index].includes("=")) {
      let textEnc = splitted[index].split(/=(.+)/)[1];
      let textPrefix = splitted[index].split(/=(.+)/)[0];
      if (textEnc && textPrefix) {
        encryptedElement = decryptElement(textEnc.trim(), keyType);
        elementRetrieved = textPrefix + "=" + encryptedElement + "\n";
      }
      fileText += elementRetrieved;
    }
  }
  return fileText.replace("undefined", "");
}

function encryptTxtFileValues() {
  let value = $("#decrypted_file").val();
  if (value) {
    let splitted = value.split("\n");
    const keyType = $("input[name=secret]:checked").val();
    var fileText;
    let encryptedElement;
    let elementRetrieved;
    for (let index = 0; index < splitted.length; index++) {
      if (splitted[index].includes("=")) {
        let textEnc = splitted[index].split(/=(.+)/)[1];
        let textPrefix = splitted[index].split(/=(.+)/)[0];
        if (textEnc && textPrefix) {
          encryptedElement = encryptElement(textEnc.trim(), keyType);
          elementRetrieved = textPrefix + "=" + encryptedElement + "\n";
        }
        fileText += elementRetrieved;
      }
    }
  }
  if(fileText) {
    $("#decrypted_file").val('');
    $("#decrypted_file").val(fileText.replace("undefined", ""));
    alert("Encrypt Txt Successfully ...");
  }
  
}

function save() {
  let data = $("#decrypted_file").val();
  if( data ) {
    let filename = prompt("Please enter file name:");
    if(filename) {
      var blob = new Blob([data], {type: 'text/csv'});
      if(window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, filename);
      }
      else{
          var elem = window.document.createElement('a');
          elem.href = window.URL.createObjectURL(blob);
          elem.download = filename;        
          document.body.appendChild(elem);
          elem.click();        
          document.body.removeChild(elem);
      }
    } else {
      alert('Enter file name');
    }
    
  } else {
    alert("there is no data");
  }
  
}