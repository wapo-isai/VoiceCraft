// Use the id to get a reference to the submit button
let buttonReference = document.getElementById("submit-btn");

// Use the class to get a reference to the success message notification
let successMessage = document.querySelector(".success-message");

// Use the class to get a reference to the error message notification
let errorMessage = document.querySelector(".error-message");

// Use the id to get a reference to the refresh button
let refreshButton = document.getElementById("refresh-button");

// We are going to use the AWS SDK to be able to pull files from our S3 into our application
// We need to provide the region and our access keys
AWS.config.update({
  region: "us-east-1", // Change to your region
  accessKeyId: "********************",
  secretAccessKey: "****************************************",
});

// add a javascript event listener to execute the sendText function when clicking on the submit button
buttonReference.addEventListener("click", sendText);

// Sends the text to the API Gateway
function sendText() {
  // grab a reference to the text-input field
  var text = document.getElementById("text-input").value;

  // using the javascript fetch api to execute POST requests to our API Gateway
  fetch(
    // place your API Gateway url here
    "https://apigatewayurl/dev/text-input",
    {
      method: "POST",
      // we need to send the data in JSON format
      body: JSON.stringify({text: text}),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // if this executes successfully, show success notification
      successMessage.classList.add("revert-display");
      setTimeout(function () {
        successMessage.classList.remove("revert-display");
      }, 3000);
    })
    .catch((error) => {
      // if there is an error show the error notification
      errorMessage.innerHTML = error;
      errorMessage.add("revert-display");
      setTimeout(function () {
        errorMessage.classList.remove("revert-display");
      }, 3000);
    });
}

// contructs an s3 service interface object
let s3 = new AWS.S3();

// this function grabs all the files in our bucket and lists them on our webpage
function listMp3Files() {
  var params = {
    // place your s3 bucket full name here
    Bucket: "****************************",
  };

  // listObjectsV2 returns the objects in the bucket
  // we pass in our params object created prior, and provide a callback function
  s3.listObjectsV2(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log(data);

      // grab the array of items in our bucket
      var files = data.Contents;

      // convert the object list into an html list (string) that allows downloading of the audio files
      var fileListHtml = files
        .sort(function (a, b) {
          // first sort the array by date from most recent to oldest
          return new Date(b.LastModified) - new Date(a.LastModified);
        })
        .map((file) => {
          // take each object, and convert it into a HTML list item
          // grab the file name (or key)
          var fileKey = file.Key;

          // create the url to the object in order to be able to download the file
          var fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${fileKey}`;

          // create anchor element to create a download link, display the name of the object inside of it
          return `<li><a href="${fileUrl}" download>${fileKey}</a></li>`;
        })
        .join(""); // transform this array into a string

      // we can now take the fileListHtml string and put it between <ul> (unordered list) tags
      // this will be valid HTML when it gets inserted in our div with the "file-list" id
      document.getElementById(
        "file-list"
      ).innerHTML = `<ul>${fileListHtml}</ul>`;
    }
  });
}

// call this function as soon as the application loads to see our items right away
listMp3Files();

// link the refresh button to call this listMp3Files function when clicked
refreshButton.addEventListener("click", listMp3Files);
