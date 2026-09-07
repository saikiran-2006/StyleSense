// ======================================================
// CONFIG
// ======================================================

const API_BASE_URL =
  "http://localhost:5000/api";


// ======================================================
// ELEMENTS
// ======================================================

const imageInput =
  document.getElementById(
    "imageInput"
  );

const previewImage =
  document.getElementById(
    "previewImage"
  );

const cameraBtn =
  document.getElementById(
    "cameraBtn"
  );

const captureBtn =
  document.getElementById(
    "captureBtn"
  );

const video =
  document.getElementById(
    "video"
  );

const canvas =
  document.getElementById(
    "canvas"
  );

const occasion =
  document.getElementById(
    "occasion"
  );

const style =
  document.getElementById(
    "style"
  );

const budget =
  document.getElementById(
    "budget"
  );

const colour =
  document.getElementById(
    "colour"
  );

const brand =
  document.getElementById(
    "brand"
  );

const analyzeBtn =
  document.getElementById(
    "analyzeBtn"
  );

const loadingSection =
  document.getElementById(
    "loadingSection"
  );

const resultSection =
  document.getElementById(
    "resultSection"
  );

const skinToneEl =
  document.getElementById(
    "skinTone"
  );

const colourExplanationEl =
  document.getElementById(
    "colourExplanation"
  );

const recommendedColoursEl =
  document.getElementById(
    "recommendedColours"
  );

const topWearEl =
  document.getElementById(
    "topWear"
  );

const bottomWearEl =
  document.getElementById(
    "bottomWear"
  );

const shoesEl =
  document.getElementById(
    "shoes"
  );

const watchEl =
  document.getElementById(
    "watch"
  );

const accessoriesEl =
  document.getElementById(
    "accessories"
  );

const estimatedBudgetEl =
  document.getElementById(
    "estimatedBudget"
  );

const productContainerEl =
  document.getElementById(
    "productContainer"
  );

const reasonBoxEl =
  document.getElementById(
    "reasonBox"
  );

const messagesEl =
  document.getElementById(
    "messages"
  );

const userMessageInput =
  document.getElementById(
    "userMessage"
  );

const sendBtn =
  document.getElementById(
    "sendBtn"
  );


// ======================================================
// STATE
// ======================================================

let uploadedImage = null;

let cameraStream = null;

let lastAnalysis = null;

let chatHistory = [];


// ======================================================
// IMAGE UPLOAD
// ======================================================

imageInput.addEventListener(
  "change",
  function (e) {

    const file =
      e.target.files[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "Please select an image."
      );

      return;
    }

    uploadedImage =
      file;

    const reader =
      new FileReader();

    reader.onload =
      function (event) {

        previewImage.src =
          event.target.result;

        previewImage.style.display =
          "block";
      };

    reader.readAsDataURL(
      file
    );
  }
);


// ======================================================
// OPEN CAMERA
// ======================================================

cameraBtn.addEventListener(
  "click",
  async () => {

    try {

      cameraStream =
        await navigator.mediaDevices
          .getUserMedia({
            video: true,
          });

      video.srcObject =
        cameraStream;

      video.style.display =
        "block";

      captureBtn.style.display =
        "block";

    } catch (error) {

      console.error(error);

      alert(
        "Camera permission denied."
      );
    }
  }
);


// ======================================================
// CAPTURE PHOTO
// ======================================================

captureBtn.addEventListener(
  "click",
  () => {

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const ctx =
      canvas.getContext(
        "2d"
      );

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData =
      canvas.toDataURL(
        "image/png"
      );

    previewImage.src =
      imageData;

    previewImage.style.display =
      "block";

    uploadedImage =
      imageData;

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    }

    video.style.display =
      "none";

    captureBtn.style.display =
      "none";
  }
);


// ======================================================
// VALIDATE FORM
// ======================================================

function validateForm() {

  if (!uploadedImage) {

    alert(
      "Please upload or capture an image."
    );

    return false;
  }

  if (
    budget.value.trim() === ""
  ) {

    alert(
      "Please enter your budget."
    );

    budget.focus();

    return false;
  }

  return true;
}


// ======================================================
// DATA URL TO FILE
// ======================================================

function dataUrlToFile(
  dataUrl,
  filename
) {

  const parts =
    dataUrl.split(",");

  const header =
    parts[0];

  const base64 =
    parts[1];

  const mimeMatch =
    header.match(
      /:(.*?);/
    );

  const mime =
    mimeMatch
      ? mimeMatch[1]
      : "image/png";

  const binary =
    atob(base64);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {

    bytes[i] =
      binary.charCodeAt(i);
  }

  return new File(
    [bytes],
    filename,
    {
      type: mime,
    }
  );
}


// ======================================================
// LOADING STEPS
// ======================================================

function animateLoadingSteps() {

  const steps = [
    "step1",
    "step2",
    "step3",
    "step4",
    "step5",
    "step6",
  ];

  steps.forEach(
    (id) => {

      const element =
        document.getElementById(
          id
        );

      if (element) {

        element.style.opacity =
          "0.35";
      }
    }
  );

  let i = 0;

  const interval =
    setInterval(
      () => {

        if (
          i < steps.length
        ) {

          const element =
            document.getElementById(
              steps[i]
            );

          if (element) {

            element.style.opacity =
              "1";
          }

          i++;

        } else {

          clearInterval(
            interval
          );
        }

      },
      700
    );

  return interval;
}


// ======================================================
// ANALYZE
// ======================================================

analyzeBtn.addEventListener(
  "click",
  async () => {

    if (
      !validateForm()
    ) {
      return;
    }

    loadingSection.style.display =
      "flex";

    resultSection.style.display =
      "none";

    const stepInterval =
      animateLoadingSteps();

    try {

      const formData =
        new FormData();

      const imageFile =
        uploadedImage instanceof File
          ? uploadedImage
          : dataUrlToFile(
              uploadedImage,
              "capture.png"
            );

      formData.append(
        "image",
        imageFile
      );

      formData.append(
        "occasion",
        occasion.value
      );

      formData.append(
        "style",
        style.value
      );

      formData.append(
        "budget",
        budget.value
      );

      formData.append(
        "colour",
        colour.value
      );

      formData.append(
        "brand",
        brand.value
      );

      console.log(
        "Sending image to backend..."
      );

      const response =
        await fetch(
          `${API_BASE_URL}/analyze`,
          {
            method: "POST",
            body: formData,
          }
        );

      const responseText =
        await response.text();

      let data = {};

      try {

        data =
          JSON.parse(
            responseText
          );

      } catch {

        throw new Error(
          responseText ||
          `Request failed (${response.status})`
        );
      }

      if (!response.ok) {

        throw new Error(
          data.error ||
          `Request failed (${response.status})`
        );
      }

      console.log(
        "Analysis received:",
        data
      );

      lastAnalysis =
        data;

      renderResults(
        data
      );

      resultSection.style.display =
        "block";

      resultSection.scrollIntoView({
        behavior: "smooth",
      });

    } catch (err) {

      console.error(
        "Analysis error:",
        err
      );

      alert(
        `Something went wrong: ${err.message}`
      );

    } finally {

      clearInterval(
        stepInterval
      );

      loadingSection.style.display =
        "none";
    }
  }
);


// ======================================================
// RENDER RESULTS
// ======================================================

function renderResults(
  data
) {

  // ====================================================
  // SKIN TONE
  // ====================================================

  skinToneEl.textContent =
    [
      data.skinTone,
      data.faceShape,
    ]
      .filter(Boolean)
      .join(" · ");

  // ====================================================
  // COLOUR EXPLANATION
  // ====================================================

  colourExplanationEl.textContent =
    data.colourExplanation ||
    "";

  // ====================================================
  // COLOUR SWATCHES
  // ====================================================

  recommendedColoursEl.innerHTML =
    "";

  (
    data.recommendedColours ||
    []
  ).forEach(
    (c) => {

      const swatch =
        document.createElement(
          "div"
        );

      swatch.style.display =
        "inline-flex";

      swatch.style.alignItems =
        "center";

      swatch.style.gap =
        "8px";

      swatch.style.marginRight =
        "18px";

      swatch.style.marginTop =
        "12px";

      const dot =
        document.createElement(
          "span"
        );

      dot.style.display =
        "inline-block";

      dot.style.width =
        "22px";

      dot.style.height =
        "22px";

      dot.style.borderRadius =
        "50%";

      dot.style.background =
        c.hex ||
        "#4F8EF7";

      dot.style.border =
        "1px solid rgba(255,255,255,.3)";

      const label =
        document.createElement(
          "span"
        );

      label.textContent =
        c.name ||
        c.hex ||
        "";

      swatch.appendChild(
        dot
      );

      swatch.appendChild(
        label
      );

      recommendedColoursEl.appendChild(
        swatch
      );
    }
  );

  // ====================================================
  // OUTFIT
  // ====================================================

  const outfit =
    data.outfit ||
    {};

  topWearEl.textContent =
    outfit.topWear ||
    "-";

  bottomWearEl.textContent =
    outfit.bottomWear ||
    "-";

  shoesEl.textContent =
    outfit.shoes ||
    "-";

  watchEl.textContent =
    outfit.watch ||
    "-";

  accessoriesEl.textContent =
    outfit.accessories ||
    "-";

  // ====================================================
  // BUDGET
  // ====================================================

  estimatedBudgetEl.textContent =
    `₹${Number(
      data.estimatedBudget ||
      0
    ).toLocaleString(
      "en-IN"
    )}`;

  // ====================================================
  // PRODUCTS
  // ====================================================

  renderProducts(
    data.products ||
    []
  );

  // ====================================================
  // REASON
  // ====================================================

  reasonBoxEl.textContent =
    data.reasonBox ||
    "";

  // ====================================================
  // RESET CHAT
  // ====================================================

  chatHistory = [];

  messagesEl.innerHTML =
    "";

  addMessage(
    "bot",
    "Your fashion report is ready! Ask me anything about your outfit, colours, shoes, accessories or alternatives."
  );
}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(
  products
) {

  productContainerEl.innerHTML =
    "";

  if (
    !products ||
    products.length === 0
  ) {

    productContainerEl.innerHTML = `

      <div style="
        padding:30px;
        text-align:center;
        color:#aaa;
        width:100%;
      ">

        <h3>
          No products found
        </h3>

        <p>
          Try again or check your SerpAPI key.
        </p>

      </div>

    `;

    return;
  }

  products.forEach(
    (p) => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "product";

      const imageUrl =
        p.imageUrl ||
        "";

      const productUrl =
        p.productUrl ||
        "#";

      const productName =
        escapeHtml(
          p.name ||
          "Fashion Product"
        );

      const category =
        escapeHtml(
          p.category ||
          ""
        );

      const brandStyle =
        escapeHtml(
          p.brandStyle ||
          ""
        );

      const store =
        escapeHtml(
          p.store ||
          "Online Store"
        );

      const price =
        Number(
          p.estimatedPrice ||
          0
        ).toLocaleString(
          "en-IN"
        );

      card.innerHTML = `

        ${
          imageUrl
            ? `
              <img
                src="${escapeHtml(imageUrl)}"
                alt="${productName}"
                class="productImage"
                loading="lazy"
              >
            `
            : `
              <div class="productImagePlaceholder">
                No Image
              </div>
            `
        }

        <div class="productInfo">

          <h3>
            ${productName}
          </h3>

          <p>
            ${category}

            ${
              brandStyle
                ? ` · ${brandStyle}`
                : ""
            }
          </p>

          <p class="store">
            ${store}
          </p>

          <div class="price">
            ₹${price}
          </div>

          <a
            href="${escapeHtml(productUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="buyBtn productButton"
          >
            View Product
          </a>

        </div>
      `;

      productContainerEl.appendChild(
        card
      );
    }
  );
}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(
  value
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    String(
      value || ""
    );

  return div.innerHTML;
}


// ======================================================
// CHAT MESSAGE
// ======================================================

function addMessage(
  role,
  text
) {

  const div =
    document.createElement(
      "div"
    );

  div.className =
    role === "user"
      ? "userMessage"
      : "botMessage";

  div.textContent =
    text;

  messagesEl.appendChild(
    div
  );

  messagesEl.parentElement.scrollTop =
    messagesEl.parentElement
      .scrollHeight;
}


// ======================================================
// SEND CHAT
// ======================================================

async function sendChatMessage() {

  const text =
    userMessageInput.value.trim();

  if (!text) {
    return;
  }

  if (!lastAnalysis) {

    alert(
      "Run an analysis first so the AI has context to chat about."
    );

    return;
  }

  // ====================================================
  // USER MESSAGE
  // ====================================================

  addMessage(
    "user",
    text
  );

  chatHistory.push({
    role: "user",
    content: text,
  });

  userMessageInput.value =
    "";

  sendBtn.disabled =
    true;

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/chat`,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({

              message:
                text,

              analysisContext:
                lastAnalysis,

              history:
                chatHistory,

            }),
        }
      );

    const responseText =
      await response.text();

    let data = {};

    try {

      data =
        JSON.parse(
          responseText
        );

    } catch {

      throw new Error(
        responseText ||
        `Request failed (${response.status})`
      );
    }

    if (!response.ok) {

      throw new Error(
        data.error ||
        `Request failed (${response.status})`
      );
    }

    // ==================================================
    // BOT MESSAGE
    // ==================================================

    addMessage(
      "bot",
      data.reply ||
        "I couldn't generate a response."
    );

    chatHistory.push({
      role: "assistant",
      content:
        data.reply,
    });

  } catch (err) {

    console.error(
      "Chat error:",
      err
    );

    addMessage(
      "bot",
      `Sorry, something went wrong: ${err.message}`
    );

  } finally {

    sendBtn.disabled =
      false;

    userMessageInput.focus();
  }
}


// ======================================================
// CHAT BUTTON
// ======================================================

sendBtn.addEventListener(
  "click",
  sendChatMessage
);


// ======================================================
// ENTER KEY
// ======================================================

userMessageInput.addEventListener(
  "keydown",
  (e) => {

    if (
      e.key === "Enter"
    ) {

      e.preventDefault();

      sendChatMessage();
    }
  }
);