export const applyStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
  //we are event delegation here
  //we are getting the ansi code from the data attribute of the button
  const ansiCode = e.currentTarget.dataset.ansi;

  //if the ansicode is not present or it is 0 for reset then we are setting the value of the input to empty
  if (!ansiCode) {
    e.currentTarget.value = "";
    return;
  }

  //we are getting the selection object from the window object

  const selection = window.getSelection();

  //if the selection is not present then we are returning immediately
  if (!selection) return;

  //extracting the selected text

  const text = selection.toString();
  if (!text) return;

  //creating a new span element and adding the text to it
  const span = document.createElement("span");
  span.innerText = text;

  //adding the class to the span element dynamically

  span.classList.add(`ansi-${ansiCode}`);

  //creating a range oject first

  const range = selection.getRangeAt(0);

  //deleting the contents of the range object
  range.deleteContents();
  //inserting the span element into the range object
  range.insertNode(span);
  //setting the range object to the span element
  range.selectNodeContents(span);
  //removing all the ranges from the selection object
  selection.removeAllRanges();
  //adding the range object to the selection object
  selection.addRange(range);
};
