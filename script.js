const SUPABASE_URL = "https://ktnxjpekpaylhjgeebpc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnhqcGVrcGF5bGhqZ2VlYnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODYwMjEsImV4cCI6MjA5NjU2MjAyMX0.I58EnbavObr6DuYMvUv-BqdEsZDRdpidQq0WaypkBWM";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

// ============================
// LOAD PHOTOS (HOME PAGE)
// ============================

async function loadPhotos() {

  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  try {

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/photos?select=*`,
      { headers }
    );

    const photos = await res.json();

    console.log("Photos response:", photos);

    if (!Array.isArray(photos)) {
      console.error("Supabase returned:", photos);
      gallery.innerHTML =
        "<h2>Error loading photos. Check console.</h2>";
      return;
    }

    gallery.innerHTML = "";

    photos.forEach(photo => {

      gallery.innerHTML += `
        <div class="card">
          <img src="${photo.image_url}" alt="">
          <h3>${photo.name}</h3>
          <p>${photo.description}</p>
        </div>
      `;

    });

  } catch(err) {
    console.error(err);
  }

}
// ============================
// UPLOAD PHOTO
// ============================

async function uploadPhoto() {

  const name = document.getElementById("name").value;
  const desc = document.getElementById("desc").value;
  const file = document.getElementById("file").files[0];

  const msg = document.getElementById("msg");
  const btn = document.querySelector(".form-card button");

  if (!name || !file) {
    alert("Please enter name and choose photo");
    return;
  }

  try {

    btn.disabled = true;
    btn.innerText = "Uploading...";

    msg.innerHTML = "⏳ Uploading photo, please wait...";

    const fileName =
      `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Upload image
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/photos/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        body: (() => {
          const fd = new FormData();
          fd.append("file", file);
          return fd;
        })()
      }
    );

    if (!uploadRes.ok) {
      throw new Error("Storage upload failed");
    }

    const imageUrl =
      `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;

    // Save to database
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/photos`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name,
          description: desc,
          image_url: imageUrl
        })
      }
    );

    if (!dbRes.ok) {
      throw new Error("Database save failed");
    }

    msg.innerHTML = "✅ Photo uploaded successfully!";

    document.getElementById("name").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("file").value = "";

  } catch (err) {

    console.error(err);

    msg.innerHTML =
      "❌ Upload failed. Please try again.";

  } finally {

    btn.disabled = false;
    btn.innerText = "Upload Photo";

  }
}

// ============================
// ADMIN LOGIN
// ============================

function loginAdmin() {

  const password =
    document.getElementById("adminPass").value;

  if (password === "admin123") {

    document.getElementById("loginBox").style.display = "none";

    document.getElementById("adminPanel").style.display = "block";

    loadAdminPhotos();

  } else {
    alert("Wrong Password");
  }
}

// ============================
// LOAD ADMIN PHOTOS
// ============================

async function loadAdminPhotos() {

  const panel =
    document.getElementById("adminGallery");

  if (!panel) return;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/photos?select=*`,
    { headers }
  );

  const photos = await res.json();

  panel.innerHTML = "";

  photos.forEach(photo => {

    panel.innerHTML += `
      <div class="card">

        <img src="${photo.image_url}" alt="photo">

        <br><br>

        <input
          id="name-${photo.id}"
          value="${photo.name}"
        >

        <br><br>

        <textarea
          id="desc-${photo.id}"
        >${photo.description}</textarea>

        <br><br>

        <button
          onclick="updatePhoto('${photo.id}')">
          Save
        </button>

        <button
          onclick="deletePhoto('${photo.id}')">
          Delete
        </button>

      </div>
    `;
  });
}

// ============================
// UPDATE PHOTO DETAILS
// ============================

async function updatePhoto(id) {

  const name =
    document.getElementById(`name-${id}`).value;

  const description =
    document.getElementById(`desc-${id}`).value;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/photos?id=eq.${id}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        name,
        description
      })
    }
  );

  if (res.ok) {
    alert("Updated Successfully");
  } else {
    alert("Update Failed");
  }
}

// ============================
// DELETE PHOTO
// ============================

async function deletePhoto(id) {

  const confirmDelete =
    confirm("Delete this photo?");

  if (!confirmDelete) return;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/photos?id=eq.${id}`,
    {
      method: "DELETE",
      headers
    }
  );

  if (res.ok) {

    alert("Deleted");

    loadAdminPhotos();

  } else {

    alert("Delete Failed");
  }
}