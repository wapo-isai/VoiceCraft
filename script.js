let buttonReference = document.getElementById("submit-btn");
let successMessage = document.querySelector(".success-message");
let errorMessage = document.querySelector(".error-message");
let refreshButton = document.getElementById("refresh-button");

AWS.config.update({
  region: "us-east-1", // Change to your region
  accessKeyId: "********************",
  secretAccessKey: "****************************************",
});

buttonReference.addEventListener("click", sendText);

function sendText() {
  var text = document.getElementById("text-input").value;
  console.log(text);
  fetch(
    // place your API Gateway url here
    "https://apigatewayurl/dev/text-input",
    {
      method: "POST",
      body: JSON.stringify({text: text}),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      successMessage.classList.add("revert-display");
      setTimeout(function () {
        successMessage.classList.remove("revert-display");
      }, 3000);
    })
    .catch((error) => {
      errorMessage.innerHTML = error;
      errorMessage.add("revert-display");
      setTimeout(function () {
        errorMessage.classList.remove("revert-display");
      }, 3000);
    });
}

let s3 = new AWS.S3();
function listMp3Files() {
  var params = {
    // place your s3 bucket full name here
    Bucket: "****************************",
  };

  s3.listObjectsV2(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log(data);
      var files = data.Contents;
      var fileListHtml = files
        .sort(function (a, b) {
          return new Date(b.LastModified) - new Date(a.LastModified);
        })
        .map((file) => {
          var fileKey = file.Key;
          var fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${fileKey}`;
          return `<li><a href="${fileUrl}" download>${fileKey}</a></li>`;
        })
        .join("");

      document.getElementById(
        "file-list"
      ).innerHTML = `<ul>${fileListHtml}</ul>`;
    }
  });
}

listMp3Files();

refreshButton.addEventListener("click", listMp3Files);
