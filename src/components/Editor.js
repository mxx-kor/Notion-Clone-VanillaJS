export default function Editor({
  $target,
  initialState = {
    title: "",
    content: "",
  },
  onEditing,
}) {
  const $editor = document.createElement("div");
  $editor.className = "editor-container";

  $target.appendChild($editor);

  this.state = initialState;
  let init = false;

  this.setState = (nextState) => {
    this.state = nextState;
    $editor.querySelector("[name=title]").value = this.state.title;
    $editor.querySelector("[name=content]").value = this.state.content;
    if ($editor.querySelector("[name=title]").value === "제목 없음") {
      $editor.querySelector("[name=title]").value = "";
    }
    this.render();
  };

  this.render = () => {
    if (!init) {
      $editor.innerHTML = `
        <input class="editor-input" type="text" placeholder="제목을 입력하세요" name="title" value="${this.state.title}" />
        <textarea class="editor-content" name="content" placeholder="여기에 내용을 입력하세요">${this.state.content}</textarea>
      `;
    }
    init = true;
  };

  this.render();

  $editor.addEventListener("keyup", (e) => {
    const { target } = e;
    const name = target.getAttribute("name");
    if (this.state[name] !== undefined) {
      const nextState = {
        ...this.state,
        [name]: target.value,
      };

      this.setState(nextState);
      onEditing(this.state);
    }
  });
}
