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
<div class="reply-card">

    <div class="score-badge">
        <button onclick="voteUp(${reply.id})" class="signs">
            <img src="images/icon-plus.svg">
        </button>

        <span>${reply.score}</span>

        <button onclick="voteDown(${reply.id})" class="signs">
            <img src="images/icon-minus.svg">
        </button>
    </div>

    <div class="comment-content">

        <div class="comment-header">
            <img src="${reply.user.image.webp}">
            <span class="username">${reply.user.username}</span>
            <span class="timestamp">${reply.createdAt}</span>
        </div>

        <p class="comment-text">
            ${reply.content}
        </p>

    </div>

    <div class="actions">

        ${
            reply.user.username === currentUser.username
            ? `
            <button onclick="deleteBtn(${reply.id})" class="delete-btn">
                <img src="images/icon-delete.svg" alt="">
            </button>

            <button onclick="editBtn(${reply.id})" class="edit-btn">
                <img src="images/icon-edit.svg" alt="">
            </button>
            `
            : `
            <button class="reply-btn">
                <img src="images/icon-reply.svg" alt=""><p>Reply</p>
            </button>
            `
        }

    </div>

</div>
`;
        });

        // Main parent comment layout
     const cardLayout = `
<div class="comment-card">

    <div class="score-badge">
        <button onclick="voteUp(${comment.id})" class="signs">
            <img src="images/icon-plus.svg" alt="">
        </button>

        <span>${comment.score}</span>

        <button onclick="voteDown(${comment.id})" class="signs">
            <img src="images/icon-minus.svg" alt="">
        </button>
    </div>

    <div class="comment-content">

        <div class="comment-header">
            <img src="${comment.user.image.webp}" alt="${comment.user.username}">

            <span class="username">
                ${comment.user.username}
            </span>

            <span class="timestamp">
                ${comment.createdAt}
            </span>
        </div>

        <p class="comment-text">
            ${comment.content}
        </p>

    </div>

    <div class="actions">

        ${
            comment.user.username === currentUser.username
            ? `
            <button onclick="deleteBtn(${comment.id})" class="delete-btn">
                <img src="images/icon-delete.svg" alt="">
            </button>

            <button onclick="editBtn(${comment.id})" class="edit-btn">
                <img src="images/icon-edit.svg" alt="">
            </button>
            `
            : `
            <button class="reply-btn">
                <img src="images/icon-reply.svg" alt=""><p>Reply</p>
            </button>
            `
        }

    </div>
</div>
    ${
        allReplies
        ? `
        <div class="replies">
            ${allReplies}
        </div>
        `
        : ""
    }


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