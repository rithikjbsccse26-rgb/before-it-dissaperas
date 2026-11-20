const MEMORY_KEY="beforeItDisappearsMemories";
const FAV_KEY="beforeItDisappearsFavourites";
const PROFILE_KEY="beforeItDisappearsProfile";
const sampleMemories=[
{id:"sample1",title:"The Quiet Streets",place:"A familiar neighbourhood",category:"Childhood",story:"The streets where evening walks felt endless and every sunset seemed special.",image:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900",date:"2025-01-12"},
{id:"sample2",title:"The Old Bookshop",place:"A little bookshop",category:"Childhood",story:"A little shop filled with books, quiet corners and beautiful memories.",image:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900",date:"2025-03-04"},
{id:"sample3",title:"Somewhere by the Sea",place:"The coast",category:"Nature",story:"The sound of waves and a thousand thoughts left behind.",image:"https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900",date:"2025-06-18"},
{id:"sample4",title:"Mountain Morning",place:"The mountains",category:"Travel",story:"A peaceful morning surrounded by mountains and fresh air.",image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",date:"2025-09-02"},
{id:"sample5",title:"An Evening Together",place:"With friends",category:"Friends",story:"A simple evening with friends that became a special memory.",image:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900",date:"2025-11-21"}];
function getMemories(){return JSON.parse(localStorage.getItem(MEMORY_KEY)||"[]")}
function saveMemories(list){localStorage.setItem(MEMORY_KEY,JSON.stringify(list))}
function getFavourites(){return JSON.parse(localStorage.getItem(FAV_KEY)||"[]")}
function saveFavourites(list){localStorage.setItem(FAV_KEY,JSON.stringify(list))}
function allMemories(){return sampleMemories.concat(getMemories())}
const menuBtn=document.getElementById("menuBtn");
if(menuBtn)menuBtn.onclick=()=>document.getElementById("navLinks").classList.toggle("open");

// Share form and photo preview.
const form=document.getElementById("memoryForm");
if(form){
 const photo=document.getElementById("photo"),preview=document.getElementById("preview");
 photo.onchange=()=>{
  const file=photo.files[0];if(!file){preview.hidden=true;return}
  if(!file.type.startsWith("image/")||file.size>1024*1024){alert("Please choose an image smaller than 1 MB.");photo.value="";preview.hidden=true;return}
  const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;preview.hidden=false};reader.readAsDataURL(file);
 };
 form.onsubmit=e=>{
  e.preventDefault();
  const save=image=>{
   const list=getMemories();list.unshift({id:"user-"+Date.now(),title:document.getElementById("title").value.trim(),place:document.getElementById("place").value.trim(),category:document.getElementById("category").value,story:document.getElementById("story").value.trim(),image,date:document.getElementById("memoryDate").value||new Date().toISOString().slice(0,10)});
   try{saveMemories(list);document.getElementById("formMessage").textContent="Your memory has been saved!";form.reset();preview.hidden=true}
   catch(err){document.getElementById("formMessage").textContent="Storage is full. Try a smaller photograph."}
  };
  const file=photo.files[0];if(file){const reader=new FileReader();reader.onload=()=>save(reader.result);reader.readAsDataURL(file)}else save("");
 };
}

// Reusable memory card creation.
function makeCard(memory,showFavourite=true){
 const card=document.createElement("article");card.className="memory-card";
 const img=document.createElement("img");img.src=memory.image||"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900";img.alt="Memory photograph";
 const body=document.createElement("div");body.className="card-body";
 const h=document.createElement("h3");h.textContent=memory.title;
 const meta=document.createElement("p");meta.textContent=memory.category+" · "+memory.place;
 const story=document.createElement("p");story.textContent=memory.story.length>100?memory.story.slice(0,100)+"…":memory.story;
 const actions=document.createElement("div");actions.className="actions";
 const favs=getFavourites();
 if(showFavourite){const fav=document.createElement("button");fav.className="small-btn";fav.textContent=favs.includes(memory.id)?"♥ Saved":"♡ Favourite";fav.onclick=()=>{let f=getFavourites();f=f.includes(memory.id)?f.filter(x=>x!==memory.id):f.concat(memory.id);saveFavourites(f);location.reload()};actions.append(fav)}
 if(memory.id.startsWith("user-")){const del=document.createElement("button");del.className="small-btn";del.textContent="Delete";del.onclick=()=>{if(confirm("Delete this memory?")){saveMemories(getMemories().filter(x=>x.id!==memory.id));saveFavourites(getFavourites().filter(x=>x!==memory.id));location.reload()}};actions.append(del)}
 body.append(h,meta,story,actions);card.append(img,body);return card;
}

// Memory archive: search, category and sort.
const gallery=document.getElementById("memoryGallery");
if(gallery){
 const search=document.getElementById("searchInput"),category=document.getElementById("categoryFilter"),sort=document.getElementById("sortOrder");
 function render(){
  let list=allMemories(),term=search.value.toLowerCase();
  list=list.filter(m=>(m.title+" "+m.place+" "+m.story).toLowerCase().includes(term)&&(category.value==="All"||m.category===category.value));
  list.sort((a,b)=>sort.value==="newest"?new Date(b.date)-new Date(a.date):new Date(a.date)-new Date(b.date));
  gallery.innerHTML="";if(!list.length){gallery.textContent="No memories found.";return}
  list.forEach(m=>gallery.append(makeCard(m)));
 }
 [search,category,sort].forEach(el=>el.addEventListener(el===search?"input":"change",render));render();
}

// Favourite page.
const favGallery=document.getElementById("favouriteGallery");
if(favGallery){const list=allMemories().filter(m=>getFavourites().includes(m.id));if(!list.length)favGallery.textContent="No favourites yet. Visit Memories and select Favourite on a card.";else list.forEach(m=>favGallery.append(makeCard(m)))}

// Timeline page.
const timeline=document.getElementById("timelineList");
if(timeline){const list=allMemories().sort((a,b)=>new Date(b.date)-new Date(a.date));list.forEach(m=>{const item=document.createElement("article");item.className="timeline-item";const time=document.createElement("time");time.textContent=new Date(m.date).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});const h=document.createElement("h3");h.textContent=m.title;const p=document.createElement("p");p.textContent=m.place+" · "+m.category;const story=document.createElement("p");story.textContent=m.story;item.append(time,h,p,story);timeline.append(item)})}

// Dashboard counts and category summary.
if(document.getElementById("dashTotal")){
 const list=allMemories(),favs=getFavourites();document.getElementById("dashTotal").textContent=list.length;document.getElementById("dashPhotos").textContent=list.filter(m=>m.image).length;document.getElementById("dashFavourites").textContent=favs.length;
 const categories=["Travel","Childhood","Friends","Nature","Family","Other"],stats=document.getElementById("categoryStats");
 categories.forEach(cat=>{const n=list.filter(m=>m.category===cat).length,row=document.createElement("div");row.className="bar-row";const label=document.createElement("div");label.className="bar-label";label.textContent=cat+" ("+n+")";const bar=document.createElement("div");bar.className="bar";const fill=document.createElement("span");fill.style.width=(n/list.length*100||0)+"%";bar.append(fill);row.append(label,bar);stats.append(row)});
 const recent=document.getElementById("recentMemories");list.slice(0,4).forEach(m=>{const p=document.createElement("p");p.textContent=m.title+" — "+m.place;recent.append(p)});
}

// Home summary.
if(document.getElementById("homeCount")){document.getElementById("homeCount").textContent=allMemories().length;document.getElementById("homeFav").textContent=getFavourites().length}

// Local demo profile.
const profileForm=document.getElementById("profileForm");
if(profileForm){const profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}");document.getElementById("displayName").value=profile.name||"";document.getElementById("bio").value=profile.bio||"";profileForm.onsubmit=e=>{e.preventDefault();localStorage.setItem(PROFILE_KEY,JSON.stringify({name:document.getElementById("displayName").value,bio:document.getElementById("bio").value}));document.getElementById("profileMessage").textContent="Your profile details have been saved in this browser."}}
