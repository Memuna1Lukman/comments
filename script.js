let comments = [];
let currentUser = {};
const mainContent = document.getElementById("main-content");
const userForm = document.getElementById("user-comment");
const textArea = document.getElementById("text-area");
let currentEditId = null;

const jsonComments = async ()=>{
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        currentUser = data.currentUser;
        let stored = getSave();
        if(stored){
            comments = stored
        }else{
            comments = data.comments;
            setSave();
        }
        
        displayComments(comments);
        console.log(comments);
        return comments;
    } catch (error) {
        console.log("The error is ", error)
    }
}
jsonComments();

function displayComments(comments){
    mainContent.innerHTML = "";
    comments.forEach(comment =>{
        let allReplies = "";
        
        // Loop through replies
        comment.replies.forEach(reply =>{
           allReplies += `
           <div>
              <p>${reply.content}</p>
              <p>${reply.createdAt}</p>
              <div>
                <button onclick="voteUp(${reply.id})">plus</button>
                <p>${reply.score}</p>
                <button onclick="voteDown(${reply.id})">minus</button>
              </div> 
              <img src="${reply.user.image.webp}">
              <p>${reply.user.username}</p>
              
              <!-- Condition check for reply deletion -->
              ${reply.user.username === currentUser.username 
                ? `<button onclick="deleteBtn(${reply.id})">Delete</button>` 
                : ""
              }
              ${reply.user.username === currentUser.username 
                ? `<button onclick="editBtn(${reply.id})">Edit</button>` 
                : ""
              }
              
           </div> 
        `;
        });

        // Main parent comment layout
        const cardLayout = `
           <div>
              <p>${comment.content}</p>
              <p>${comment.createdAt}</p>
              <div>
                <button onclick="voteUp(${comment.id})">plus</button>
                <p>${comment.score}</p>
                <button onclick="voteDown(${comment.id})">minus</button>
              </div>  
              <img src="${comment.user.image.webp}">
              <p>${comment.user.username}</p>
              <p>${comment.replies.length}</p>
              <div>
                <div>${allReplies}</div> <!-- Injects clean replies here -->
              </div>
              
              <!-- Condition check for comment deletion -->
              ${comment.user.username === currentUser.username 
                ? `<button onclick="deleteBtn(${comment.id})">Delete</button>` 
                : ""
              }
              ${comment.user.username === currentUser.username 
                ? `<button onclick="editBtn(${comment.id})">Edit</button>` 
                : ""
              }
           </div> 
        `;
        
        mainContent.innerHTML += cardLayout;
        console.log(cardLayout);
    });
}
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formValue = textArea.value.trim();
    if (!formValue) return; 

    if (currentEditId !== null) {
       
        let index = comments.findIndex(itm => itm.id == currentEditId);
        if (index !== -1) {
            comments[index].content = formValue;
        } else {
            comments.forEach(comment => {
                const replyIndex = comment.replies.findIndex(reply => reply.id == currentEditId);
                if (replyIndex !== -1) {
                    comment.replies[replyIndex].content = formValue;
                }
            });
        }
    } else {
        
        const newComment = {
            id: Date.now(),
            content: formValue,
            createdAt: "just now",
            score: 0,
            user: currentUser,
            replies: []
        };
        comments.push(newComment);
    }

    
    displayComments(comments);
    setSave();
    textArea.value = "";
    currentEditId = null; 
});


function voteUp(id){
    let index = comments.findIndex(itm=>itm.id==id);
    if(index !==-1){
        comments[index].score+=1;
    }else{
        comments.forEach(comment =>{
            const replyIndex = comment.replies.findIndex(reply=>reply.id==id);
            if(replyIndex !==-1){
                comment.replies[replyIndex].score+=1
            }
        });
    }
    displayComments(comments);
    setSave();
};
function voteDown(id){
    const index = comments.findIndex(itm=>itm.id==id);
    if(index !==-1){
        comments[index].score-=1;
        if(comments[index].score<0){
          comments[index].score = 0;  
        }
    }else{
        comments.forEach(comment =>{
            const replyIndex = comment.replies.findIndex(reply=>reply.id==id);
            if(replyIndex !==-1){
                comment.replies[replyIndex].score-=1
                if(comment.replies[replyIndex].score<0){
                    comment.replies[replyIndex].score = 0;  
        }
            }
        });
    }
    setSave();
    displayComments(comments);
};

function deleteBtn(id){
    const index = comments.findIndex(itm=>itm.id == id);
    if(index !== -1){
        comments.splice(index,1)
    }else{
        comments.forEach(comment =>{
            const replyIndex = comment.replies.findIndex(reply => reply.id == id);
            if(replyIndex !== -1){
                comment.replies.splice(replyIndex,1);
            }
        })
    }
    setSave();
    displayComments(comments);
}



function editBtn(id){
    const editIndex = comments.findIndex(itm=>itm.id == id);
    if(editIndex !== -1){
        textArea.value = comments[editIndex].content;
        currentEditId = id
    }else{
        comments.forEach(comment =>{
            const index = comment.replies.findIndex(edit=>edit.id == id);
            if(index !== -1){
                textArea.value = comment.replies[index].content;
                currentEditId = id;
            }
        })
    }
    
}

function setSave(){
    localStorage.setItem("comments",JSON.stringify(comments));
    console.log("Data successfully pushed to storage!");
}
function getSave(){
    const getStored = JSON.parse(localStorage.getItem("comments"));
    return getStored;
}