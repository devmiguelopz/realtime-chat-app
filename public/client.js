
const socket = io();

class ClientController {
    Model = null;
    View = null;

    constructor(model, view) {
        this.Model = model;
        this.View = view;
        this.Initialize();
    }

    Initialize() {
        this.CreateBinding();
        this.CreateView();
    }

    CreateBinding() {
        this.Model.ReceivedMessage(this.HandleReceivedMessage.bind(this));
        this.View.BindSendMessage(this.HandleSendMessage.bind(this));
    }

    HandleReceivedMessage(messageModel) {
        this.View.ReceivedMessage(messageModel);
    }

    HandleSendMessage(messageModel) {
        this.Model.SendMessage(messageModel);
    }

    CreateView() {
        this.View.Load();
    }
}

class ClientView {
    CurrentUser = null;
    Textarea = null;
    MessageArea = null;

    constructor() {
        this.InitializeComponent();
    }

    InitializeComponent() {
        this.Textarea = document.querySelector('#textarea');
        this.MessageArea = document.querySelector('.message__area');
    }

    Load() {
        do {
            this.CurrentUser = prompt('Please enter your name: ');
        } while (!this.CurrentUser);
    }

    BindSendMessage(handleSendMessage) {
        this.Textarea.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const objMessageModel = new MessageModel()
                objMessageModel.Message = this.Textarea.value;
                objMessageModel.User = this.CurrentUser ?? "";
                handleSendMessage(objMessageModel);
                this.CreateMessage(objMessageModel);
            }
        });
    }

    CreateMessage(objMessageModel) {
        this.Textarea.value = '';
        this.InsertMessage(objMessageModel,'outgoing')
    }

    ReceivedMessage(objMessageModel) {
        this.InsertMessage(objMessageModel,'incoming')
    }

    InsertMessage(objMessageModel,type) {
        this.AppendMessage(objMessageModel, type);
        this.ScrollToBottom();
    }

    AppendMessage(msg, type) {
        const mainDiv = document.createElement('div')
        const className = type
        mainDiv.classList.add(className, 'message')

        let markup = `
            <h4>${msg.User}</h4>
            <p>${msg.Message}</p>
        `
        mainDiv.innerHTML = markup
        this.MessageArea.appendChild(mainDiv)
    }

    ScrollToBottom() {
        this.MessageArea.scrollTop = this.MessageArea.scrollHeight;
    }
}

class MessageModel {
    User = "";
    Message = "";

    SendMessage(objData) {
        objData.Message = objData.Message.trim();
        socket.emit('message', objData)
    }

    ReceivedMessage(callbackReceivedMessage) {
        socket.on('message', objData => callbackReceivedMessage(objData))
    }
}

_ = new ClientController(new MessageModel(), new ClientView());