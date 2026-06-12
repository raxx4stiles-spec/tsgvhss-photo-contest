const SUPABASE_URL = "https://ktnxjpekpaylhjgeebpc.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnhqcGVrcGF5bGhqZ2VlYnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODYwMjEsImV4cCI6MjA5NjU2MjAyMX0.I58EnbavObr6DuYMvUv-BqdEsZDRdpidQq0WaypkBWM";

const supabaseClient = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

const gallery = document.getElementById("gallery");

async function loadGallery(){

const { data, error } = await supabaseClient
.from("submissions")
.select("*")
.eq("approved", true)
.order("created_at", { ascending:false });

if(error){

console.log(error);

return;

}

if(data.length === 0){

gallery.innerHTML = `
<div class="empty">
No approved photos yet.
</div>
`;

return;

}

gallery.innerHTML = "";

data.forEach(item=>{

gallery.innerHTML += `

<div class="card">

<img src="${item.image_url}">

<div class="card-content">

<h3>${item.name}</h3>

<p>${item.description}</p>

</div>

</div>

`;

});

}

loadGallery();