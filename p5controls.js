class P5ControlStyle {
    buttonColor = color(200);
    buttonBorderColor = color(0);
    buttonTextColor = color(0);
    buttonClickedColor = color(0);
    buttonClickedBorderColor = color(0);
    buttonClickedTextColor = color(255);

    labelColor = color(0);

    textBoxColor = color(255);
    textBoxBorderColor = color(0);
    textBoxTextColor = color(0);
    textBoxPadding = 8;
    textBoxBlinkerSpeed = 50;
    textBoxBlinkerColor = color(0);
    textBoxSelectionColor = color(200);

    checkBoxCheckColor = color(0);

    toolTipColor = color(255);
    toolTipTextColor = color(0);
    toolTipPadding = 4;

    listBoxColor = color(255);
    listBoxBorderColor = color(0);
    listBoxTextColor = color(0);
    listBoxSelectedColor = color(0);
    listBoxSelectedTextColor = color(255);
}

class P5Button {
    type = "Button";
    parent; window; style;

    isResizable = true;

    initialized = false;

    text = "Button";

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    image;

    #x = 5;
    #y = 5;
    #w = 80;
    #h = 25;
    absx = 0;
    absy = 0;

    borderWidth = 2;

    #textTop = 0;
    #textFits = true;

    #hover = false;

    #imageX = 0;
    #imageY = 0;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private width
        this.#w = value;

        if (this.initialized) {
            // Check if text fits in the control
            this.#textFits = (textWidth(this.text) < this.#w);

            // Set image location
            this.#imageX = round(this.#w / 2);
        }
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;

        if (this.initialized) {
            // Update text position
            this.#textTop = (this.#h - this.manager.fontSize) / 2 + 1;

            // Set image location
            this.#imageY = round(this.#h / 2);
        }
    }

    init() {    // Called just before showing form
        this.initialized = true;

        // Update the text position
        this.w = this.#w;
        this.h = this.#h;
    }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        // Set hover and focus state
        this.#hover = this.manager.pointInsideBounds(mouseX, mouseY,
            this.absx, this.absy, this.#w, this.#h);
        this.focus = (this.#hover && this.window.mouseIsPressed);

        // Create vars for current button color pallete
        var buttonBorderColor, buttonColor, buttonTextColor;

        // Copy values from stylesheet
        if (this.focus) {
            buttonBorderColor = this.style.buttonClickedBorderColor;
            buttonColor = this.style.buttonClickedColor;
            buttonTextColor = this.style.buttonClickedTextColor;
        } else {
            buttonBorderColor = this.style.buttonBorderColor;
            buttonColor = this.style.buttonColor;
            buttonTextColor = this.style.buttonTextColor;

            if (this.#hover && this.window.mouseIsReleased) {
                this.onClick();
            }
        }

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.fill(buttonBorderColor);
        c.rect(0, 0, this.#w, this.#h);

        c.fill(buttonColor);
        c.rect(this.borderWidth, this.borderWidth,
            this.#w - 2 * this.borderWidth, this.#h - 2 * this.borderWidth);

        if (this.#textFits) {
            c.fill(buttonTextColor);

            c.textAlign(CENTER, TOP);
            c.textStyle(BOLD);

            c.text(this.text, 0, this.#textTop, this.#w, this.#h);

            c.textAlign(LEFT, TOP);
            c.textStyle(NORMAL);
        }

        // Draw button image if it is set
        if (this.image != null) {
            c.imageMode(CENTER);
            c.image(this.image, this.#imageX, this.#imageY);
            c.imageMode(CORNER);
        }

        c.pop();
    }

    onClick() { }    // Triggered when button is clicked
    // Left empty for the user to decide the action
}

class P5ListBox {

    type = "ListBox";
    parent; window; style;

    isResizable = true;

    initialized = false;

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    items;

    #selectedItem = 0;

    borderWidth = 2;

    #x = 5;
    #y = 5;
    #w = 80;
    #h = 25;
    absx = 0;
    absy = 0;

    hover = false;

    #items = [];

    #itemHeight = 16;

    #maxLength = 0;
    #clippingLength = [];

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private width
        this.#w = value; 

        if (this.initialized) {
            // Update text clipping
            this.#updateTextClipping();
        }
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;

        // Update the maximum listbox capacity
        this.#updateMaxLength();
    }

    get itemHeight() {
        // Return private item height value
        return this.#itemHeight;
    }

    set itemHeight(value) {
        // Set private item height value
        this.#itemHeight = value;

        // Update the maximum listbox capacity
        this.#updateMaxLength();
    }

    get selectedItem() {
        // Return private selected item value
        return this.#selectedItem;
    }

    set selectedItem(value) {
        // Check if value has changed
        if (this.#selectedItem != value) {
            // Set private selected item value
            this.#selectedItem = value;

            // Call change event
            this.onChange();
        }
    }

    constructor() {
        // Create array change handler
        var lb = this;
        var arrayChangeHandler = {
            get: function (target, property) {
                return target[property];
            },
            set: function (target, property, value, receiver) {
                target[property] = value;

                // Update text clipping when setting an item property 
                if (lb.initialized) {
                    // Update text clipping
                    lb.#updateTextClipping();
                }

                return true;
            }
        };

        // Set public items array
        this.items = new Proxy(this.#items, arrayChangeHandler);
    }

    init() {    // Called just before showing form
        this.initialized = true;

        // Update the text position
        this.w = this.#w;
        this.h = this.#h;
    }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        // Set hover and focus state
        this.hover = this.manager.pointInsideBounds(mouseX, mouseY, this.absx, this.absy, this.#w, this.#h);
        this.focus = (this.hover && this.window.mouseIsPressed);

        if (this.focus) {
            this.#onClick();
        }

        if (this.hover && this.window.mouseIsReleased) {
            this.onClick();
        }

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.fill(this.style.listBoxBorderColor);
        c.rect(0, 0, this.#w, this.#h);

        c.fill(this.style.listBoxColor);
        c.rect(this.borderWidth, this.borderWidth,
            this.#w - 2 * this.borderWidth, this.#h - 2 * this.borderWidth);

        c.textAlign(LEFT, CENTER);

        // Draw the items
        for (var i = 0; i < this.#items.length; i++) {

            // Check if item fits in the lbx
            if (i < this.#maxLength) {

                var itemText = "";
                var textClipping = this.#clippingLength[i];

                // Check if text fits into the item
                if (textClipping == -1) {
                    // If so then set item text to the whole text
                    itemText = this.#items[i];
                } else {
                    // Else clip the text so that it fits
                    itemText = this.#items[i].substring(0, this.#clippingLength[i]);
                }

                // Check if item selected
                if (this.selectedItem == i) {

                    // Draw a highlight rectangle
                    c.fill(this.style.listBoxSelectedColor);
                    c.rect(this.borderWidth, this.borderWidth + i * this.#itemHeight,
                        this.#w - 2 * this.borderWidth, this.#itemHeight);

                    c.fill(this.style.listBoxSelectedTextColor)
                } else {
                    c.fill(this.style.listBoxTextColor);
                }

                // Draw the item text
                c.text(itemText, 2 * this.borderWidth, this.borderWidth
                    + i * this.#itemHeight + this.#itemHeight / 2 + 1);
            }
        }

        c.textAlign(LEFT, TOP);

        c.pop();
    }

    #updateMaxLength() { // Updates the maximum amount of items that fit in a lbx
        this.#maxLength = Math.floor((this.#h - 2 * this.borderWidth) / this.#itemHeight);
    }

    #updateTextClipping() { // Determines the max length of text that fits into the ctrl (for every item)
        // Reset clipping length for all items
        this.#clippingLength = [];

        // Loop through all items
        for (var i = 0; i < this.#items.length; i++) {
            // Get max length for current item and add it to array
            this.#clippingLength.push(this.#getMaxTextLengthForItem(i));
        }
    }

    #getMaxTextLengthForItem(itemNo) {  // Returns the max length of text that fits into the ctrl
        // Loop through all the characters in the item
        for (var i = 0; i < this.#items[itemNo].length; i++) {
            // Get length of the substring
            var len = textWidth(this.#items[itemNo].substring(0, i));

            // Check if it fits into the control
            if (len > this.#w - 4 * this.borderWidth) {
                // If it doesn't then return the length for which it did
                return i - 1;
            }
        }

        // If the text fits into the control then return -1
        return -1;
    }

    #onClick() { // Triggered when listbox is clicked

        // Get the clicked item id
        var itemClicked = Math.floor((this.parent.mouseY - this.#y - this.borderWidth) / this.#itemHeight);

        // If item exists set selected item to it
        if (itemClicked > -1 && itemClicked < this.#items.length) {
            this.selectedItem = itemClicked;
        }
    }

    onClick() { }

    onChange() { }
}

class P5ToolTip {
    type = "ToolTip";
    parent; window; style;

    isResizable = false;

    offsetX = 20;
    offsetY = 20;

    toolTips = [];

    #x = 0;
    #y = 0;
    #w = 100;
    #h = 100;

    x; y; w; h;

    init() { }

    render() {  // Renders the ctrl to the given canvas

        // Get the control that the mouse is currently over
        var ctrl = this.parent.controlAtPoint(mouseX, mouseY);

        // Check if the window is selected and if its not being resized
        // Check if mouse is over control
        if (this.window.isOnTop && ctrl != null && !this.window.moveInProgress && !this.window.resizeInProgress) {

            // Loop through all the tips
            for (var i = 0; i < this.toolTips.length; i++) {

                // Get the owner of the tip
                var tipCtrl = this.toolTips[i][0];

                // Check if the control hovered on matches the owner of the tooltip
                if (ctrl == tipCtrl) {

                    // Get the tooltip text and set the displayed text
                    this.text = this.toolTips[i][1];

                    // Set tooltip position
                    this.#w = textWidth(this.text) + 2 * this.style.toolTipPadding;
                    this.#h = this.manager.fontSize + 2 * this.style.toolTipPadding;

                    // Set tooltip dimmensions
                    this.#x = this.parent.mouseX + this.offsetX;
                    this.#y = this.parent.mouseY + this.offsetY;

                    // Draw the tooltip background
                    stroke(0);
                    fill(this.style.toolTipColor);
                    rect(this.#x, this.#y, this.#w, this.#h);

                    // Draw the tooltip text
                    noStroke();
                    fill(this.style.toolTipTextColor);
                    text(this.text, this.#x + this.style.toolTipPadding, this.#y + this.style.toolTipPadding);
                }
            }
        }
    }

    addToolTip(ctrl, tipText) { // Adds a tooltip to the specified control
        // Push an entry to the 2d array
        this.toolTips.push([ctrl, tipText]);
    }
}

class P5CheckBox {
    type = "CheckBox";
    parent; window; style;

    isResizable = true;

    initialized = false;

    text = "CheckBox";

    #hover = false;

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    checked = false;

    borderWidth = 2;
    checkBoxSize = 16;

    #x = 5;
    #y = 5;
    #w = 100;
    #h = 16;
    absx = 0;
    absy = 0;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private height
        this.#w = value;
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;
    }

    init() {    // Called just before showing form
        this.initialized = true;

        // Update the text position
        this.w = this.#w;
        this.h = this.#h;
    }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        // Set hover and focus state
        this.#hover = this.manager.pointInsideBounds(mouseX, mouseY,
            this.absx, this.absy, this.#w, this.#h);
        this.focus = (this.#hover && this.window.mouseIsPressed);

        // Create vars for current button color pallete
        var buttonBorderColor, buttonColor, buttonTextColor;

        // Copy values from stylesheet
        if (this.focus) {
            buttonBorderColor = this.style.buttonClickedBorderColor;
            buttonColor = this.style.buttonClickedColor;
        } else {
            buttonBorderColor = this.style.buttonBorderColor;
            buttonColor = this.style.buttonColor;
            buttonTextColor = this.style.buttonTextColo

            if (this.#hover && this.window.mouseIsReleased) {
                this.#onClick();
            }
        }

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.fill(buttonBorderColor);
        c.rect(0, 0, this.checkBoxSize, this.checkBoxSize);

        c.fill(buttonColor);
        c.rect(this.borderWidth, this.borderWidth, this.checkBoxSize - 2 * this.borderWidth, this.checkBoxSize - 2 * this.borderWidth);

        // Draw check if checked
        if (this.checked) {
            c.stroke(this.style.checkBoxCheckColor);
            c.strokeWeight(2);
            c.line(this.borderWidth, this.borderWidth, this.checkBoxSize - this.borderWidth, this.checkBoxSize - this.borderWidth);
            c.line(this.checkBoxSize - this.borderWidth, this.borderWidth, this.borderWidth, this.checkBoxSize - this.borderWidth);
            c.noStroke();
        }

        // Draw text
        c.fill(this.style.labelColor);
        c.text(this.text, 20, 3);

        c.pop();
    }

    #onClick() { // Triggered when checkbox is clicked
        // Toggle check
        this.checked = !this.checked;

        // Call public event handler
        this.onClick();
    }

    onClick() { }
}

class P5PictureBox {
    type = "PictureBox";
    parent; window; style;

    isResizable = true;

    initialized = false;

    image = MSGBOX_INFO_ICON;

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    #x = 5;
    #y = 5;
    #w = 30;
    #h = 30;
    absx = 0;
    absy = 0;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private height
        this.#w = value;
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;
    }

    init() {    // Called just before showing form
        this.initialized = true;

        // Update the text position
        this.w = this.#w;
        this.h = this.#h;
    }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.image(this.image, 0, 0, this.#w, this.#h)

        c.pop();
    }
}

class P5TextBox {
    type = "TextBox";
    parent; window; style;

    isResizable = true;

    initialized = false;

    active = false;

    #text = "";

    textFits = true;

    lines = [];

    longestLineLength = 0;

    textClipping;

    hover = false;

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    numOnly = false;
    acceptFloat = false;

    maxLength = -1;

    multiline = false;

    borderWidth = 2;

    selectionStart = -1;
    selectionEnd = -1;
    selectionVertices = [];
    textSelected = false;

    #cursorPos = 0;

    #x = 5;
    #y = 5;
    #w = 80;
    #h = 25;
    absx = 0;
    absy = 0;

    #textTop = 0;

    curX = 0;
    curY = 0;
    curH = 0;

    selX = 0;
    selY = 0;
    selW = 0;
    selH = 0;

    #blinkerVisibleFor = 0;
    blinkerVisible = false;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private height
        this.#w = value;

        if (this.initialized) {
            // Check if text fits into the control
            this.#updateTextClipping();
        }
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;

        if (this.initialized) {
            // Update text position
            this.#textTop = (this.#h - this.manager.fontSize) / 2 + 1;
        }
    }

    get text() {
        // Return private text value
        return this.#text;
    }

    set text(value) {
        // Set private text value
        this.#text = value;

        // Split textbox text into lines
        this.lines = this.#text.split("\n");

        if (this.initialized) {
            // Update textbox text clipping
            this.#updateTextClipping();
        }

        // Trigger text changed event
        this.onChange();
    }

    get cursorPos() {
        // Return private cursor pos
        return this.#cursorPos;
    }

    set cursorPos(value) {
        // Set private cursor pos
        this.#cursorPos = value;

        // Update cursor location on screen
        if (this.lines.length <= 1) {
            this.curX = this.style.textBoxPadding + textWidth(this.#text.substring(0, this.cursorPos)) + 1;
            this.curH = this.manager.fontSize;
            this.curY = this.#textTop - 2;
        } else {
            var cursorLine = this.#positionToLine(this.#cursorPos);

            this.curX = this.style.textBoxPadding + textWidth(this.#text.substring(0, this.cursorPos)) + 1 - this.#getWidthOfLinesPriorTo(cursorLine);
            this.curH = this.manager.fontSize;
            this.curY = this.#textTop - 2 + cursorLine * this.manager.fontLeading;
        }
    }

    init() {    // Called just before showing form
        this.initialized = true;

        // Update the text position
        this.w = this.#w;
        this.h = this.#h;

        // Update cursor position
        this.cursorPos = 0;
    }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        // Set hover state
        this.hover = this.manager.pointInsideBounds(mouseX, mouseY, this.absx, this.absy, this.#w, this.#h);

        if (!this.active && this.hover && this.window.mouseIsPressed) {
            this.#onClick();
        }

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.fill(this.style.textBoxBorderColor);
        c.rect(0, 0, this.#w, this.#h);

        c.fill(this.style.textBoxColor);
        c.rect(this.borderWidth, this.borderWidth, this.#w - 2 * this.borderWidth, this.#h - 2 * this.borderWidth);

        // Check if textbox selected
        if (this.active) {

            // Check if text fits
            if (this.textFits) {
                // Check if text is selected
                if (this.textSelected) {
                    c.fill(this.style.textBoxSelectionColor);
    
                    // Draw selection rectangle
                    c.rect(this.selX, this.selY, this.selW, this.selH);
                }
    
                // Check if blinker visible and if text fits
                if (this.blinkerVisible) {
                    // Draw blinker
                    c.fill(this.style.textBoxBlinkerColor);
                    c.rect(this.curX, this.curY, 1, this.curH);
                }
            }

            // Increase the blinker visibilty timer
            this.#blinkerVisibleFor++;

            // If timer reaches the amount of time it should be visible
            if (this.#blinkerVisibleFor == this.style.textBoxBlinkerSpeed) {

                // Reset timer
                this.#blinkerVisibleFor = 0;

                // Switch blinker visibility
                this.blinkerVisible = !this.blinkerVisible;
            }
        }

        c.fill(this.style.textBoxTextColor);

        // Check if text fits
        if (this.textFits) {

            // If so then draw the whole text to the canvas
            c.text(this.#text, this.style.textBoxPadding, this.#textTop);
        } else if (this.textClipping == -1) {

            // If text doesn't fit but first line fits
            // Then draw the first line
            c.text(this.lines[0], this.style.textBoxPadding, this.#textTop);
        } else {

            // If text doesn't fit and 1st line doesn't fit
            // Draw first line until the char that doesn't fit
            c.text(this.lines[0].substring(0, this.textClipping), this.style.textBoxPadding, this.#textTop);
        }

        c.pop();
    }

    keyPressed(k) { // Triggered by the manager when new key pressed or repeated

        // Check if key isn't a special key
        if (k.length == 1) {

            var interceptKey = false;

            // Check if key is control key is pressed
            if (this.manager.controlKeyPressed) {

                var short = k.toLowerCase();

                if (short == "a") {
                    // Select whole text
                    this.selectText(0, this.#text.length);

                    // Move cursor to end of text
                    this.cursorEnd();

                    // Disable further key presses
                    interceptKey = true;
                } else if (short == "c") {
                    // Copy selected text to clipboard
                    navigator.clipboard.writeText(this.getSelectedText());

                    // Disable further key presses
                    interceptKey = true;
                } else if (short == "x") {
                    // Copy selected text to clipboard
                    navigator.clipboard.writeText(this.getSelectedText());

                    // Remove selected text
                    this.removeSelectedText();

                    // Disable further key presses
                    interceptKey = true;                    
                } else if (short == "v") {                    
                    // Get text from clipboard and paste it when it's ready
                    navigator.clipboard.readText().then(text => this.pasteText(text));

                    // Check if browser is going to prompt user for permissions
                    navigator.permissions.query({name:'clipboard-read'}).then(function(result) {
                        if (result.state === 'prompt') {
                            // Manually release keys (they get stuck when the prompt is opened)
                            key = "Control";
                            keyReleased();
                            key = k;
                            keyReleased();
                        }
                    });

                    // Disable further key presses
                    interceptKey = true;
                }
            }

            if (!interceptKey) {
                // Check if text exceeds max length or length set to infinity
                var isRightLength = (this.maxLength == -1 || this.#text.length < this.maxLength);
    
                // Check if key is a number or if validation is turned off
                var isRightFormat = (!this.numOnly || (!isNaN(k) && k != " ") || this.acceptFloat && k == ".");
    
                if (isRightLength && isRightFormat) {

                    // Remove selected text
                    if (this.textSelected) {
                        this.removeSelectedText();
                    }

                    // Type the key
                    this.text = this.#text.substring(0, this.cursorPos) + k + this.#text.substring(this.cursorPos, this.#text.length);

                    // Move cursor to the right
                    this.cursorPos++;
                }
            }
        } else {
            if (k == "Backspace") {

                // Check if text is selected
                if (this.textSelected) {
                    // Check if whole text selected
                    if (this.selectionStart == 0 && this.selectionEnd == this.#text.length) {
                        // Remove the whole text
                        this.text = "";

                        // Move cursor to start
                        this.cursorHome();
                    } else {
                        // Else remove selected text
                        this.removeSelectedText();
                    }

                    // Deselect text
                    this.deselectText();
                } else if (this.cursorPos > 0) {
                    // Else remove char behind the cursor
                    this.text = this.#text.substring(0, this.cursorPos - 1) + this.#text.substring(this.cursorPos, this.#text.length);

                    // Move the cursor left
                    this.cursorPos--;
                }

            } else if (k == "Delete" && this.cursorPos < this.text.length) {

                // Remove char following the cursor
                this.text = this.#text.substring(0, this.cursorPos) + this.#text.substring(this.cursorPos + 1, this.#text.length);

            } else if (k == "ArrowLeft" && this.cursorPos > 0) {
                
                // Check if shift pressed (user wants to select text)
                if (this.manager.shiftKeyPressed) {
                    if (this.#cursorPos == this.selectionEnd) {
                        if (this.selectionStart + 1 == this.selectionEnd) {
                            this.deselectText();
                        } else {
                            this.selectText(this.selectionStart, this.selectionEnd - 1);
                        }
                    } else if (!this.textSelected) {
                        this.selectText(this.#cursorPos - 1, this.#cursorPos);
                    } else {
                        this.selectText(this.selectionStart - 1, this.selectionEnd);
                    }
                } else {
                    // Deselect text
                    this.deselectText();
                }

                this.cursorPos--;

            } else if (k == "ArrowRight" && this.cursorPos < this.#text.length) {
                
                // Check if shift pressed (user wants to select text)
                if (this.manager.shiftKeyPressed) {
                    if (this.#cursorPos == this.selectionStart) {
                        if (this.selectionStart + 1 == this.selectionEnd) {
                            this.deselectText();
                        } else {
                            this.selectText(this.selectionStart + 1, this.selectionEnd);
                        }
                    } else if (!this.textSelected) {
                        this.selectText(this.#cursorPos, this.#cursorPos + 1);
                    } else {
                        this.selectText(this.selectionStart, this.#cursorPos + 1);
                    }
                } else {
                    // Deselect text
                    this.deselectText();
                }

                this.cursorPos++;

            } else if (k == "Home") {
                this.cursorHome();
            } else if (k == "End") {
                this.cursorEnd();
            } else if (k == "Enter" && this.multiline) {
                this.keyPressed("\n");
            }
        }

        // Show blinker
        this.blinkerVisible = true;

        // Reset blinker visible timer
        this.#blinkerVisibleFor = 0;
    }

    cursorHome() {  // Moves cursor to start of text
        this.cursorPos = 0;
    }
    
    cursorEnd() {   // Moves cursor to end of text
        this.cursorPos = this.#text.length;
    }

    selectText(from, to) {
        this.textSelected = true;

        this.selectionStart = from;
        this.selectionEnd = to;

        if (this.lines.length == 1) {
            this.selX = this.style.textBoxPadding + textWidth(this.#text.substring(0, from));
            this.selY = this.#textTop;
            this.selW = textWidth(this.#text.substring(from, to));
            this.selH = this.manager.fontSize;
        } else {
            var selStartLine = this.#positionToLine(this.selectionStart);
            var selEndLine = this.#positionToLine(this.selectionEnd);
            
            var fl = this.manager.fontLeading;
            var st = this.#textTop + selStartLine * this.manager.fontLeading;
            var sl = this.style.textBoxPadding;
            var sr = this.longestLineLength;

            var chl = textWidth(this.#text.substring(0, this.selectionStart)) - this.#getWidthOfLinesPriorTo(selStartLine);
            var chr = textWidth(this.#text.substring(0, this.selectionEnd)) - this.#getWidthOfLinesPriorTo(selEndLine);
            var libh = (selEndLine - selStartLine) * fl;
            
            var sv = this.selectionVertices = [];
            
            sv.push([sl, st + fl]);
            sv.push([sl + chl, st + fl]);
            sv.push([sl + chl, st]);
            sv.push([sl + sr, st]);
            sv.push([sl + sr, st + libh]);
            sv.push([sl + chr, st + libh]);
            sv.push([sl + chr, st + libh + fl]);
            sv.push([sl, st + fl + libh]);
            sv.push([sl, st + fl]);
        }
    }

    deselectText() {
        this.textSelected = false;

        this.selectionStart = -1;
        this.selectionEnd = -1;
    }

    removeSelectedText() { // Removes selected text
        // Remove selected text
        this.text = this.#text.substring(0, this.selectionStart) + this.#text.substring(this.selectionEnd, this.#text.length);

        // Move cursor to before the selection
        this.cursorPos = this.selectionStart;

        // Deselect text
        this.deselectText();
    }
    
    getSelectedText() {
        return this.#text.substring(this.selectionStart, this.selectionEnd);
    }

    pasteText(text) {
        if (this.#checkIfValid(text)) {

            // If text selected remove it
            if (this.textSelected) {
                this.removeSelectedText();
            }

            // Add text to where the cursor is
            this.text = this.#text.substring(0, this.#cursorPos) + text + this.#text.substring(this.#cursorPos, this.#text.length);
            
            // Move cursor to after the pasted text
            this.cursorPos += text.length;
        }
    }

    #checkIfValid(text) { // Checks if text can be pasted into textbox
        // Check if text exceeds max length or length set to infinity
        var isRightLength = (this.maxLength == -1 || this.#text.length + text.length <= this.maxLength);

        // Check if text is a number or if validation is turned off
        var isRightFormat = (!this.numOnly || (!isNaN(text) && !text.includes(" ")) || this.acceptFloat && k.contains("."));

        return (isRightLength && isRightFormat);
    }

    #updateTextClipping() {   // Checks if text fits into textbox and gets the longest tb line
        // Get maximum length of first line that fits into the control
        this.textClipping = this.#getMaxFirstLineLength();

        // Get the longest line length
        if (this.lines.length <= 1) {
            // If there's only 1 or no lines then set lll the width of the entire text
            this.longestLineLength = textWidth(this.#text);
        } else {

            // Find the longest line
            var max = 0;

            for (var i = 0; i < this.lines.length; i++) {

                var len = textWidth(this.lines[i]);

                if (len > max) {
                    max = len;
                }
            }

            // Set lll to the found length
            this.longestLineLength = max;
        }

        // Text fits if there is only 1 line of text and if the text fits into the control
        this.textFits = (this.lines.length <= 1) && this.textClipping == -1;
    }

    #getMaxFirstLineLength() {  // Returns the maximum width that the first line of text can have and not overflow
        if (this.lines.length > 0) {
            // Get first line
            var firstLine = this.lines[0];

            // Loop through all characters inside the line
            for (var i = 0; i < firstLine.length; i++) {
                // Get width of text until the character
                var len = textWidth(firstLine.substring(0, i));

                // Check if that width overflows and return it
                if (len > this.#w - 4 - 2 * this.style.textBoxPadding) {
                    return i;
                }
            }
        }

        return -1;
    }

    #positionToLine(pos) {  // Returns the line a character is on based on it's position

        for (var i = 0; i < this.lines.length; i++) {
            // Get line length
            var lineLength = this.lines[i].length;

            // Check if character is on this line
            if (lineLength < pos) {
                // Subtract amount of characters in line + 1 for the \n character
                pos -= lineLength + 1;
            } else {
                // Return line number
                return i;
            }
        }

        return -1;
    }

    #getWidthOfLinesPriorTo(line) { // Returns the combined width in pixels of the lines before a line
        // Create width variable
        var w = 0;

        for (var i = 0; i < line; i++) {
            // Increase total by width of line
            w += textWidth(this.lines[i] + "\n");
        }

        return w;
    }

    #onClick() { // Triggered when the control is clicked

        // Deactivate all other textboxes
        this.parent.deactivateAllTextBoxes();

        // Show the blinker and reset the timer
        this.#blinkerVisibleFor = 0;
        this.blinkerVisible = true;

        // Activate textbox
        this.active = true;

        // Set the container's active textbox to this textbox
        this.parent.selectedTextBox = this;

        // Call public event handler
        this.onClick();
    }

    onClick() { }

    onChange() { }

    onDeactivate() { }
}

class P5TextBoxOverflow {
    type = "TextBoxOverflow";
    parent; window; style;

    #x = 5;
    #y = 5;
    #w = 100;
    #h = 100;

    init() { }

    render() {
        // Get selected textbox
        var tb = this.parent.selectedTextBox;

        // Check if there is one selected (if there isn't, tb == null)
        // Check if text doesn't fit into the tb
        if (tb != null && !tb.textFits) {

            // Set overflow rect bounds
            this.#x = tb.x;
            this.#y = tb.y + tb.h;
            this.#w = tb.longestLineLength + 2 * this.style.textBoxPadding;
            this.#h = (tb.lines.length - 1) * this.manager.fontLeading + this.manager.fontSize + 2 * this.style.textBoxPadding;

            push();

            translate(this.#x, this.#y);

            fill(this.style.textBoxColor);
            stroke(this.style.textBoxBorderColor);

            // Draw overflow field
            rect(0, 0, this.#w, this.#h);

            noStroke();

            // Check if there is text selected in the tb
            if (tb.textSelected) {
                fill(this.style.textBoxSelectionColor);

                // Check if there is more than one line
                if (tb.lines.length > 1) {

                    // Draw selection shape using vertices provided by textbox
                    beginShape();
    
                        for (var i = 0; i < tb.selectionVertices.length; i++) {
                            vertex(tb.selectionVertices[i][0], tb.selectionVertices[i][1]);
                        }
    
                    endShape();
                } else {
                    // Draw selection rectangle
                    rect(tb.selX, tb.selY, tb.selW, tb.selH);
                }
            }

            // Draw text
            fill(this.style.textBoxTextColor);
            text(tb.text, this.style.textBoxPadding, this.style.textBoxPadding);
            
            // Check if blinker visible
            if (tb.blinkerVisible) {
                // Draw blinker
                rect(tb.curX, tb.curY, 1, tb.curH);
            }

            pop();
        }
    }
}

class P5Label {
    type = "Label";
    parent; window; style;

    isResizable = true;

    text = "Label";

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    #x = 5;
    #y = 5;
    #w = 100;
    #h = 100;
    absx = 0;
    absy = 0;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private height
        this.#w = value;
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;
    }

    init() { }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.fill(this.style.labelColor);
        c.text(this.text, 0, 0, this.#w, this.#h);

        c.pop();
    }
}

class P5Canvas {
    type = "Canvas";
    parent; window; style;

    #canvasRenderer = P2D;
    canvas = createGraphics(1, 1);

    mouseX = 0;
    mouseY = 0;

    isResizable = true;

    anchorLeft = true;
    anchorTop = true;
    anchorBottom = false;
    anchorRight = false;

    #x = 5;
    #y = 5;
    #w = 100;
    #h = 100;
    absx = 0;
    absy = 0;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;
    }

    get w() {
        // Return private width
        return this.#w;
    }

    set w(value) {
        // Set private height
        this.#w = value;

        this.#resetCanvasSize();
    }

    get h() {
        // Return private height
        return this.#h;
    }

    set h(value) {
        // Set private height
        this.#h = value;

        this.#resetCanvasSize();
    }

    get canvasRenderer() {
        // Return value of private canvas renderer field
        return this.#canvasRenderer;
    }

    set canvasRenderer(value) {
        // Set private canvas renderer field
        this.#canvasRenderer = value;

        // Create canvas with the new renderer
        this.canvas = createGraphics(this.#w, this.#h, this.#canvasRenderer);
    }

    init() {
        // Update canvas size
        this.w = this.#w;
        this.h = this.#h;
    }

    render() {    // Renders the ctrl to the given canvas

        var c = this.parent.canvas;

        this.mouseX = mouseX - this.absx;
        this.mouseY = mouseY - this.absy;

        // Trigger onclick evt
        if (this.manager.pointInsideBounds(this.mouseX, this.mouseY, 0, 0, this.#w, this.#h) && this.window.mouseIsReleased) {
            this.onClick();
        }

        // Draw control to panel canvas
        c.push();

        c.translate(this.#x, this.#y);

        c.image(this.canvas, 0, 0);

        c.pop();
    }

    #resetCanvasSize() {    // Sets the canvas size after change of width and height of the control
        // Check if canvas size is not negative (happens when window is minimized and canvas is anchored to window)
        if (this.#w > 0 && this.#h > 0) {
            if (this.#canvasRenderer == WEBGL) {
                // Resize canvas if canvas renderer is WEBGL
                this.canvas.resizeCanvas(this.#w, this.#h);
            } else {
                // Else save old canvas
                var oldCanvas = this.canvas;
    
                // Create canvas of new size and copy the old canvas to it
                this.canvas = createGraphics(this.#w, this.#h, this.#canvasRenderer);
                this.canvas.image(oldCanvas, 0, 0);
            }
        }
    }

    onClick() { }
}

class P5Container {
    type = "Container";
    parent; window;

    initalized = false;

    canvas = createGraphics(1, 1);

    controls = [];

    backColor = color(255);

    mouseX = 0;
    mouseY = 0;

    selectedTextBox;

    textBoxOverflow = new P5TextBoxOverflow();
    toolTip = new P5ToolTip();

    #x = 50;
    #y = 50;
    #w = 100;
    #h = 100;
    absx = 0;
    absy = 0;

    get x() {
        // Return private x pos
        return this.#x;
    }

    set x(value) {
        // Set private x pos
        this.#x = value;


        if (this.initialized) {
            // Update absolute ctrl position
            this.absx = this.parent.absx + this.#x;
        }

        // Update children ctrls absolute position
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];
            ctrl.absx = this.absx + ctrl.x;
        }
    }

    get y() {
        // Return private y pos
        return this.#y;
    }

    set y(value) {
        // Set private y pos
        this.#y = value;


        if (this.initialized) {
            // Update absolute ctrl position
            this.absy = this.parent.absy + this.#y;
        }

        // Update children ctrls absolute position
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];
            ctrl.absy = this.absy + ctrl.y;
        }
    }

    get w() {
        // Return the private width
        return this.#w;
    }

    set w(value) {
        // Send parent resized event to all controls
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];

            if (ctrl.isResizable && ctrl.anchorRight) {
                if (ctrl.anchorLeft) {
                    // If anchors right & left
                    // ...change the width of the ctrl by the diff of container width
                    ctrl.w += value - this.#w;
                } else {
                    // If anchors right
                    // ...move the the ctrl by the diff of container width
                    ctrl.x += value - this.#w;
                }
            }
        }

        // Set the private width
        this.#w = value;

        // Save old canvas
        var oldCanvas = this.canvas;

        // Create canvas of new size and copy the old canvas to it
        this.canvas = createGraphics(this.#w, this.#h, P2D);
        this.canvas.image(oldCanvas, 0, 0);
    }

    get h() {
        // Return the private height
        return this.#h;
    }

    set h(value) {
        // Send parent resized event to all controls
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];

            if (ctrl.isResizable && ctrl.anchorBottom) {
                if (ctrl.anchorTop) {
                    // If anchors top & bottom
                    // ...change the height of the ctrl by the diff of container height
                    ctrl.h += value - this.#h;
                } else {
                    // If anchors bottom
                    // ...move the the ctrl by the diff of container height
                    ctrl.y += value - this.#h;
                }
            }
        }

        // Set the private width
        this.#h = value;

        // Save old canvas
        var oldCanvas = this.canvas;

        // Create canvas of new size and copy the old canvas to it
        this.canvas = createGraphics(this.#w, this.#h, P2D);
        this.canvas.image(oldCanvas, 0, 0);
    }

    init() {    // Called just before showing form

        // Set init state
        this.initialized = true;

        // Initialize all controls
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];
            this.initializeControl(ctrl);
        }

        // Initialize textbox overflow ctrl and tooltip ctrl
        this.initializeControl(this.textBoxOverflow);
        this.initializeControl(this.toolTip);
    }

    render() {  // Renders the ctrl on screen

        var c = this.canvas;

        this.mouseX = this.window.mouseX - this.#x;
        this.mouseY = this.window.mouseY - this.#y;

        // Check if mouse over container
        this.hover = this.manager.pointInsideBounds(mouseX, mouseY, this.absx, this.absy, this.#w, this.#h);

        // Check if mouse released and over container
        if (this.hover && this.window.mouseIsReleased) {

            // Trigger onClick event
            this.#onClick();
        }

        var c = this.canvas;

        // Disable canvas stroke and draw background
        c.noStroke();
        c.textAlign(LEFT, TOP);
        c.background(this.backColor);

        // Update text font and size
        c.textFont(this.manager.font);
        c.textSize(this.manager.fontSize);
        c.textLeading(this.manager.fontLeading);

        // Render all controls to the canvas
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];
            ctrl.render();
        }

        push();

        // Render the canvas
        translate(this.#x, this.#y);
        image(c, 0, 0);

        // Render the textbox overflow
        this.textBoxOverflow.render();

        // Render the tooltip
        this.toolTip.render();

        pop();
    }

    addControl(ctrl) {  // Adds the given control to the controls list
        // Set ctrl parent
        ctrl.parent = this;

        // Add ctrl to list
        this.controls.push(ctrl);

        if (this.initialized) {
            // Re-initialize all controls
            this.init();
        }
    }

    removeControl(ctrl) {   // Removes the given control from the list
        this.controls.splice(this.controls.indexOf(ctrl), 1);
    }

    removeAllControls() {
        this.controls = [];
    }

    initializeControl(ctrl) {   // Makes ctrl ready for display

        // Set basic vars
        ctrl.manager = this.manager;
        ctrl.parent = this;
        ctrl.window = this.window;
        ctrl.style = this.manager.controlStyle;

        // Check if control has init function
        ctrl.init();
    }

    getControlsOfType(type) {   // Returns a list of controls of given type in cont

        // Create empty list
        var ctrls = [];

        // Loop through all ctrls
        for (var i = 0; i < this.controls.length; i++) {
            var ctrl = this.controls[i];

            // If ctrl type matches desired type
            if (ctrl.type == type) {

                // Add ctrl to list
                ctrls.push(ctrl);
            }
        }

        // Return list
        return ctrls;
    }

    controlAtPoint(x, y) {  // Returns the ctrl at a given point

        // Loop through all the controls in REVERSE order to find the TOMPOST control
        for (var i = this.controls.length - 1; i > -1; i--) {

            // Get the current control
            var ctrl = this.controls[i];

            // Return the ctrl if the point is inside it
            if (this.manager.pointInsideBounds(x, y, ctrl.absx, ctrl.absy, ctrl.w, ctrl.h)) {
                return ctrl;
            }
        }

        // If no ctrl is found return null
        return null;
    }

    refreshTheme() {    // Refreshes the theme for all controls

        // Loop through all the controls
        for (var i = 0; i < this.controls.length; i++) {

            // Set the control style to the manager's default ctrl style
            this.controls[i].style = this.manager.controlStyle;
        }
    }

    bringControlToFront(sender) { // Brings the specified control to front

        // Move the specified control to the last place in array
        this.controls.push(this.controls.splice(this.controls.indexOf(sender), 1)[0]);
    }

    deactivateAllTextBoxes() {   // Deactivates all textboxes

        // Get all textboxes
        var ctrls = this.getControlsOfType("TextBox");

        // Loop through them
        for (var i = 0; i < ctrls.length; i++) {
            var ctrl = ctrls[i];

            // Set active flag to false
            if (ctrl.active) {
                ctrl.active = false;
                ctrl.onDeactivate();
            }
        }
    }

    #onClick() { // Triggered when the container is clicked

        // Get the control mouse is over
        var ctrl = this.controlAtPoint(mouseX, mouseY);

        // Run if the mouse is over nothing or over any ctrl other than textbox
        if (ctrl == null || ctrl.type != "TextBox") {

            // Deactivate all textboxes
            this.deactivateAllTextBoxes();

            // Set the selected textbox to none
            this.selectedTextBox = null;
        }

        // Call public event handler
        this.onClick();
    }

    onClick() { }
}