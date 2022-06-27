/*
*	p5forms for p5.js (Version 1.22.06.22)
*	Easily create and manage windows and controls on the p5.js canvas
*	Created by Bartosz Morawiec, 2022
*	https://bmorawiec.github.io/
*/


const WND_STATE_NORMAL = 0, WND_STATE_MAXIMIZED = 1, WND_STATE_MINIMIZED = 2;

var DEFAULT_WINDOW_STYLE, DEFAULT_CONTROL_STYLE;
var WND_MAXIMIZE_ICON, WND_RESTORE_ICON, WND_CLOSE_ICON, WND_RESIZE_ICON,
	WND_MINIMIZE_ICON;
var MSGBOX_WARN_ICON, MSGBOX_INFO_ICON, MSGBOX_STOP_ICON,
	MSGBOX_QUESTION_ICON;
var BTN_CHECKED_ICON;

class P5FormStyle {
	borderColor = color(0);
	titleBarColor = color(200);
	titleBarFontColor = color(0);
	ghostColor = color(0);
	titleBarButtonColor = color(128);
	inactiveTitleBarColor = color(255);

	windowAnimationLength = 10;

	windowShadowDistance = 5;
	windowShadowColor = color(0, 100);
}

class P5FormManager {
	libVersion = 1.220622;
	libAuthor = "io.github.bmorawiec";
	libFork = "bmorawiec";

	forms = [];

	#windowStyle; #controlStyle;

	windowMoveInProgress = false;

	font = "Share Tech Mono";
	fontSize = 12;
	fontLeading = 14;

	mouseIsReleased = false;
	oldMouseState = false;

	keyJustPressed = false;
	oldKeyState = false;

	selectedWindow;

	keyPressedFor = 0;
	keyThreshold = 30;

	lockKeyRepeats = false;

	controlKeyPressed = false;
	shiftKeyPressed = false;

	get windowStyle() {
		// Return private window style
		return this.#windowStyle;
	}

	set windowStyle(value) {
		// Set private window style
		this.#windowStyle = value;

		// Refresh theme for all windows
		for (var i = 0; i < this.forms.length; i++) {
			this.forms[i].style = this.windowStyle;
		}
	}

	get controlStyle() {
		// Return private ctrl style
		return this.#controlStyle
	}

	set controlStyle(value) {
		// Set private ctrl style
		this.#controlStyle = value;

		// Refresh theme for all window containers
		for (var i = 0; i < this.forms.length; i++) {
			this.forms[i].container.refreshTheme();
		}
	}

	constructor() {
		// Set default wnd style and ctrl style
		DEFAULT_WINDOW_STYLE = new P5FormStyle();
		DEFAULT_CONTROL_STYLE = new P5ControlStyle();

		// Set wnd style and ctrl style
		this.windowStyle = DEFAULT_WINDOW_STYLE;
		this.controlStyle = DEFAULT_CONTROL_STYLE;

		// Load fonts
		this.addCssToHeader("p5forms_fonts.css");

		// Load all icons
		WND_MAXIMIZE_ICON = loadImage("p5forms_data/maximize.png");
		WND_RESTORE_ICON = loadImage("p5forms_data/restore.png");
		WND_CLOSE_ICON = loadImage("p5forms_data/close.png");
		WND_RESIZE_ICON = loadImage("p5forms_data/resize.png");
		WND_MINIMIZE_ICON = loadImage("p5forms_data/minimize.png");

		MSGBOX_STOP_ICON = loadImage("p5forms_data/stop.png");
		MSGBOX_WARN_ICON = loadImage("p5forms_data/warn.png");
		MSGBOX_INFO_ICON = loadImage("p5forms_data/info.png");
		MSGBOX_QUESTION_ICON = loadImage("p5forms_data/question.png");

		BTN_CHECKED_ICON = loadImage("p5forms_data/checked.png");
	}

	showForm(form) {	// Shows the specified form
		// If form already added bring to front
		if (this.forms.includes(form)) {

			this.bringFormToFront(form);
		} else {
			// Set form manager
			form.manager = this;

			// Apply style
			form.style = this.windowStyle;

			// Initialize form
			form.init();

			// Add form to the list
			this.forms.push(form);

			// Call onShow form event
			form.onShow();
			// Set selected window to new form
			this.selectedWindow = form;

			// Play window show animation
			form.windowAnimationPlayer.playAnimation(form.x, form.y, form.w, 0, form.x, form.y, form.w, form.h, form.style.windowAnimationLength);
		}
	}

	closeForm(form) {	// Closes the specified form

		// Call onClose form event
		form.onClose();

		// Remove form from list
		this.forms.splice(this.forms.indexOf(form), 1);

		// Update the selected window
		this.selectedWindow = this.forms[this.forms.length - 1];
	}

	bringFormToFront(sender) { // Brings the specified form to front

		if (sender.msgbox == null) {

			// Move the specified form to the last place in array
			this.forms.push(this.forms.splice(this.forms.indexOf(sender), 1)[0]);

			// Set the selected window to last place in array
			this.selectedWindow = this.forms[this.forms.length - 1];
		} else {

			// If a messagebox is assigned to the form bring it to front
			this.bringFormToFront(sender.msgbox);
		}
	}

	isOnTop(sender) {	// Checks if form is selected
		// Check if form is last in array
		return (this.forms.indexOf(sender) == this.forms.length - 1);
	}

	pointInsideTopWindow(x, y) {	// Checks if point is inside the selected wnd
		// Define the last form
		var lastForm = this.forms[this.forms.length - 1];

		// Check if point is inside form
		return this.pointInsideBounds(x, y, lastForm.x, lastForm.y,
			lastForm.w, lastForm.h);
	}

	pointInsideBounds(px, py, x, y, w, h) {	// Checks if point is inside a given rect
		return (px > x && px < x + w && py > y && py < y + h);
	}

	renderForms() {	// Draws all forms
		// Set font size, style and leading
		textFont(this.font);
		textSize(this.fontSize);
		textLeading(this.fontLeading);

		// Disable outline
		noStroke();

		// Check if mouse is released and handle key repeats
		this.#handleKeys();
		this.mouseIsReleased = (this.oldMouseState && !mouseIsPressed);

		// Cycle the forms in the reverse order
		for (var i = this.forms.length - 1; i > -1; i--) {
			this.forms[i].cycle();
		}

		// Render the forms in the correct order
		for (var i = 0; i < this.forms.length; i++) {
			this.forms[i].render();
		}

		// Save the old mouse state
		this.oldMouseState = mouseIsPressed;
	}

	keyPressed() {	// Triggered when key pressed (manually include in keyPressed)
		// Reset key press timer
		this.keyPressedFor = 0;

		// Enable key repeats
		this.lockKeyRepeats = false;

		// Check if ctrl or shift key pressed
		if (key == "Control") {
			this.controlKeyPressed = true;
		} else if (key == "Shift") {
			this.shiftKeyPressed = true;
		}
	}

	keyReleased() { // Triggered when key released (manually include in keyPressed)
		// Disable key repeats
		this.lockKeyRepeats = true;

		// Check if ctrl or shift key released
		if (key == "Control") {
			this.controlKeyPressed = false;
		} else if (key == "Shift") {
			this.shiftKeyPressed = false;
		}
	}

	#handleKeys() {	// Handles the key repeats
		// Check if key is pressed
		if (keyIsPressed) {
			if (this.keyPressedFor == 0) {

				// If key just pressed
				// ...type the key to textbox
				this.#typeKey(key);
				this.keyPressedFor++;
			} else if (this.keyPressedFor < this.keyThreshold) {

				// If key pressed but not reached the repeat threshold yet
				// ...inc the key press timer
				this.keyPressedFor++;
			} else if (!this.lockKeyRepeats) {

				// If reached key repeat threshold
				// ...type out key to textbox
				this.#typeKey(key);
			}
		}
	}

	#typeKey(k) {	// Notifies selected textbox or window about a key press
		// Check if a wnd is open
		if (this.forms.length > 0) {

			// Find selected textbox
			var seltb = this.selectedWindow.container.selectedTextBox;

			// Check if a textbox is selected
			if (seltb != null) {

				// Notify
				seltb.keyPressed(k);
			}
		}
	}

	addCssToHeader(fileName) {	// Adds css file of given name to the html header
		var head = document.head;
		var link = document.createElement("link");

		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = fileName;

		head.appendChild(link);
	}
}

class P5MsgBox {

	#form = new P5Form();
	#pictureBox = new P5PictureBox();
	#label = new P5Label();

	get form() {
		return this.#form;
	}

	constructor() {
		// Disable resizing of the form
		this.#form.enableResizing = false;

		// Set label size and position
		this.#label.x = 60;
		this.#label.y = 15;
		this.#label.w = 250;
		this.#label.h = 40;

		this.#pictureBox.x = this.#pictureBox.y = 15;

		// Resize the msgbox
		this.#form.w = 320;
		this.#form.h = 120;

		// Remove the maximize and close buttons
		this.#form.removeWindowIcon(WND_MAXIMIZE_ICON);
		this.#form.removeWindowIcon(WND_CLOSE_ICON);
	}

	showMsgBox(wnd, title, text, icon, buttons, callback) {
		// Set the msgbox title icon and text
		this.#form.title = title;
		this.#pictureBox.image = icon;
		this.#label.text = text;

		// Remove all controls to reset the msgbox
		this.#form.container.removeAllControls();

		// Add back the picturebox and label
		this.#form.container.addControl(this.#pictureBox);
		this.#form.container.addControl(this.#label);

		// Re-center the form
		this.#form.centerOnScreen();

		// Loop through all the buttons requested by the user
		for (var i = 0; i < buttons.length; i++) {
			// Create a new button
			var btn = new P5Button();

			// Set text
			btn.text = buttons[i];

			// Add it to the msgbox
			this.#form.container.addControl(btn);

			// Move it according to it's index
			btn.x = this.#form.container.w - 85 * i - 90;
			btn.y = this.#form.container.h - 35;

			// Set the onClick event of the button
			btn.onClick = function () {

				// Close the msgbox
				wnd.manager.closeForm(wnd.msgbox);

				// Unlock the parent window
				wnd.msgbox = null;

				// If the msgbox close event function was passed
				if (callback != null) {

					// Call it with the buttons text as a parameter
					callback(this.text);
				}
			};
		}

		// Lock the parent window
		wnd.msgbox = this.#form;

		// Show the msgbox
		wnd.manager.showForm(this.#form);
	}
}

class P5Form {

	type = "Form";
	manager; style; child;

	container = new P5Container();

    enableHelpLines = false;

	#dragStartX = 0;
	#dragStartY = 0;
	#dragEndX = 0;
	#dragEndY = 0;

	#moveRectX = 0;
	#moveRectY = 0;
	#moveRectW = 0;
	#moveRectH = 0;

	moveInProgress = false;
	resizeInProgress = false;

	minw = 100;
	minh = 100;

	#resizeIconX = 0;
	#resizeIconY = 0;

	#titleBarIcons = [WND_CLOSE_ICON, WND_MAXIMIZE_ICON, WND_MINIMIZE_ICON];

	title = "Form";

	mouseIsPressed = false;
	mouseIsReleased = false;
	mouseX = 0;
	mouseY = 0;

	enableResizing = true;
	enableDragging = true;

	#oldEnableResizing = false;
	#oldEnableDragging = false;

	keepBehind = false;

	isOnTop = false;

	windowState = WND_STATE_NORMAL;

	#x = 0;
	#y = 0;
	#w = 100;
	#h = 100;
	absx = 0;
	absy = 0;

	#oldX = 0;
	#oldY = 0;
	#oldW = 0;
	#oldH = 0;

	#minimizedH = 0;

	#lastActiveForm = null;

	borderWidth = 2;
	titleBarHeight = 18;

	windowAnimationPlayer = new P5WindowAnimation(this);

	get x() {
		// Return private x pos
		return this.#x;
	}

	set x(value) {
		// Set private x pos
		this.#x = value;

		// Update absolute x pos
		this.absx = value;

		// Update container position
		this.container.x = this.borderWidth;
	}

	get y() {
		// Return private y pos
		return this.#y;
	}

	set y(value) {
		// Set private y pos
		this.#y = value;

		// Update absolute y pos
		this.absy = value;

		// Update container position
		this.container.y = this.titleBarHeight + 2 * this.borderWidth;
	}

	get w() {
		// Return private width value
		return this.#w;
	}

	set w(value) {
		// Set private width value
		this.#w = value;

		// Update title bar width
		this.titleBarWidth = this.#w - 3 * this.borderWidth - this.#titleBarIcons.length * this.titleBarHeight;

		// Update resize icon x position
		this.#resizeIconX = this.#w - this.borderWidth - 9;

		// Update container size
		this.container.w = this.#w - 2 * this.borderWidth;

		// Update anchors
		this.x = this.#x;
	}

	get h() {
		// Return private height value
		return this.#h;
	}

	set h(value) {
		// Set private height value
		this.#h = value;

		// Update resize icon y position
		this.#resizeIconY = this.#h - this.borderWidth - 9;

		// Update container size
		this.container.h = this.#h - 3 * this.borderWidth - this.titleBarHeight;

		this.#updateMinimizedHeight(this.windowState);

		// Update anchors
		this.y = this.#y;
	}

	init() {	// Called just before showing form
		// Set container manager and initialize it
		this.container.manager = this.manager;
		this.container.parent = this;
		this.container.window = this;
		this.container.init();

		// Update container position and size
		this.x = this.x;
		this.y = this.y;
		this.w = this.w;
		this.h = this.h;
	}

	removeWindowIcon(wndic) {
		this.#titleBarIcons.splice(this.#titleBarIcons.indexOf(wndic), 1);
		this.w = this.w;
	}

	centerOnScreen() {
		this.x = round((width - this.#w) / 2);
		this.y = round((height - this.#h) / 2);
	}

	setWindowState(targetWindowState) {
		if (targetWindowState == WND_STATE_MAXIMIZED) {
			// Play window animation
			this.windowAnimationPlayer.playAnimation(this.#x, this.#y, this.#w, this.#h, 0, 0, width, height, this.style.windowAnimationLength);

			if (this.windowState == WND_STATE_MINIMIZED) {
				// Change restore icon to minimize icon
				this.#titleBarIcons[this.#titleBarIcons.indexOf(WND_RESTORE_ICON)] = WND_MINIMIZE_ICON;

				// Save minimized window position
				this.#oldW = this.#w;
				this.#oldH = this.#h;
			} else {
				// Save old window position
				this.#oldX = this.#x;
				this.#oldY = this.#y;
				this.#oldW = this.#w;
				this.#oldH = this.#h;

				// Save resizable and draggable state
				this.#oldEnableResizing = this.enableResizing;
				this.#oldEnableDragging = this.enableDragging;
			}

			// Move window to top left corner
			this.x = 0;
			this.y = 0;

			// Resize window to fill the whole screen
			this.w = width;
			this.h = height;

			// Disable resizing and dragging
			this.enableResizing = false
			this.enableDragging = false;

			// Set state
			this.isMaximized = true;

			// Change maximize icon to restore icon
			this.#titleBarIcons[this.#titleBarIcons.indexOf(WND_MAXIMIZE_ICON)] = WND_RESTORE_ICON;
		} else if (targetWindowState == WND_STATE_MINIMIZED) {

			this.#updateMinimizedHeight(targetWindowState);

			if (this.windowState == WND_STATE_MAXIMIZED) {
				// Play window animation
				this.windowAnimationPlayer.playAnimation(this.#x, this.#y, this.#w, this.#h, this.#oldX, this.#oldY, this.#oldW, this.#minimizedH, this.style.windowAnimationLength);

				// Restore normal window bounds
				this.x = this.#oldX;
				this.y = this.#oldY;
				this.w = this.#oldW;
				this.h = this.#oldH;

				this.#titleBarIcons[this.#titleBarIcons.indexOf(WND_RESTORE_ICON)] = WND_MAXIMIZE_ICON;
			} else {
				// Save old window position
				this.#oldX = this.#x;
				this.#oldY = this.#y;

				// Save resizable and draggable state
				this.#oldEnableResizing = this.enableResizing;
				this.#oldEnableDragging = this.enableDragging;

				// Play window animation
				this.windowAnimationPlayer.playAnimation(this.#x, this.#y, this.#w, this.#h, this.#x, this.#y, this.#w, this.#minimizedH, this.style.windowAnimationLength);
			}

			// Disable resizing and restore resizing
			this.enableResizing = false;
			this.enableDragging = this.#oldEnableDragging;

			// Change maximize icon to restore icon
			this.#titleBarIcons[this.#titleBarIcons.indexOf(WND_MINIMIZE_ICON)] = WND_RESTORE_ICON;
		} else if (targetWindowState == WND_STATE_NORMAL) {
			if (this.windowState == WND_STATE_MAXIMIZED) {
				// Change restore icon to maximize icon
				this.#titleBarIcons[this.#titleBarIcons.indexOf(WND_RESTORE_ICON)] = WND_MAXIMIZE_ICON;

				// Play window animation
				this.windowAnimationPlayer.playAnimation(this.#x, this.#y, this.#w, this.#h, this.#oldX, this.#oldY, this.#oldW, this.#oldH, this.style.windowAnimationLength);

				// Restore old window position
				this.x = this.#oldX;
				this.y = this.#oldY;
				
				// Resize window to old size
				this.w = this.#oldW;
				this.h = this.#oldH;
			} else {
				// Play window animation
				this.windowAnimationPlayer.playAnimation(this.#x, this.#y, this.#w, this.#minimizedH, this.#x, this.#y, this.#w, this.#h, this.style.windowAnimationLength);

				// Change restore icon to minimize icon
				this.#titleBarIcons[this.#titleBarIcons.indexOf(WND_RESTORE_ICON)] = WND_MINIMIZE_ICON;
			}

			// Restore old resizable and draggable state
			this.enableResizing = this.#oldEnableResizing;
			this.enableDragging = this.#oldEnableDragging;
		}

		// Set window state
		this.windowState = targetWindowState;

		this.#updateMinimizedHeight(this.windowState);
		
		// Trigger resize event
		this.onResize();
	}

	cycle() {	// Called before render by the manager in the reverse order		
		this.isOnTop = this.manager.isOnTop(this);

		// Local mouseIsPressed is true if window is selected & mouse is pressed
		this.mouseIsPressed = mouseIsPressed && this.isOnTop && !this.manager.windowMoveInProgress;

		// Local mouseIsReleased is true if window is selected & mouse is released
		this.mouseIsReleased = this.manager.mouseIsReleased && this.isOnTop && !this.manager.windowMoveInProgress;

		// Local mouse position is the pos of the mouse relative to the wnd
		this.mouseX = mouseX - this.#x;
		this.mouseY = mouseY - this.#y;

		// If mouse inside wnd and mouse released bring the wnd to front
		if (this.manager.pointInsideBounds(mouseX, mouseY, this.#x, this.#y, this.#w, this.#minimizedH)
			&& !this.manager.windowMoveInProgress && !this.manager.pointInsideTopWindow(mouseX, mouseY) && mouseIsPressed) {

			if (this.keepBehind) {
				this.#lastActiveForm = this.manager.forms[this.manager.forms.length - 1];
			}
				
			this.manager.bringFormToFront(this);
		}

		// Handle window dragging if it is enabled
		if (this.enableDragging) {
			this.#handleMove();
		}

		// Handle wnd resizing if it is enabled
		if (this.enableResizing) {
			this.#handleResize();
		}
	}

	#handleResize() {
		// Check if this window is currently being resized, if mouse is over the titlebar and is pressed, if another window is being moved and if the window is selected
		if (!this.resizeInProgress && this.manager.pointInsideBounds(this.mouseX, this.mouseY, this.#w - this.titleBarHeight, this.#h - this.titleBarHeight, this.titleBarHeight, this.titleBarHeight)
			&& !this.manager.windowMoveInProgress && mouseIsPressed && this.isOnTop) {

			// Set drag start position to current mouse position
			this.#dragStartX = mouseX;
			this.#dragStartY = mouseY;

			// Set window flag
			this.resizeInProgress = true;

			// Set manager flag
			this.manager.windowMoveInProgress = true;
		}

		// Check if window is currently being resized
		if (this.resizeInProgress) {
			
			// Set drag end position to mouse position
			this.#dragEndX = mouseX;
			this.#dragEndY = mouseY;

			// Set ghost position and size (relative to current window pos)
			this.#moveRectX = this.#x;
			this.#moveRectY = this.#y;
			this.#moveRectW = max(this.minw, this.w + this.#dragEndX - this.#dragStartX);
			this.#moveRectH = max(this.minh, this.h + this.#dragEndY - this.#dragStartY);

			// Check if mouse was released
			if (!mouseIsPressed) {
				// Disable flag
				this.resizeInProgress = false;

				// Set size to ghost size
				this.w = this.#moveRectW;
				this.h = this.#moveRectH;

				// Disable manager flag
				this.manager.windowMoveInProgress = false;
				
				// Trigger resize event
				this.onResize();
			}
		}
	}

	#handleMove() {
		// Check if this window is currently being moved, if mouse is over the titlebar and is pressed, if another window is being moved and if the window is selected
		if (!this.moveInProgress && this.manager.pointInsideBounds(this.mouseX, this.mouseY, this.borderWidth, this.borderWidth, this.titleBarWidth, this.titleBarHeight)
			&& !this.manager.windowMoveInProgress && mouseIsPressed && this.isOnTop) {

			// Set drag start position to current mouse position
			this.#dragStartX = mouseX;
			this.#dragStartY = mouseY;

			// Set flag
			this.moveInProgress = true;

			// Set manager flag
			this.manager.windowMoveInProgress = true;
		}

		if (this.moveInProgress) {

			// Set drag end position to mouse position
			this.#dragEndX = mouseX;
			this.#dragEndY = mouseY;

			this.#moveRectX = min(width - this.#w, max(0, this.#x + this.#dragEndX - this.#dragStartX));
			this.#moveRectY = min(height - this.#h, max(0, this.#y + this.#dragEndY - this.#dragStartY));
			this.#moveRectW = this.#w;
			this.#moveRectH = this.#h;

			// Check if mouse was released
			if (!mouseIsPressed) {
				// Disable flag
				this.moveInProgress = false;

				// Set position to ghost position
				this.x = this.#moveRectX;
				this.y = this.#moveRectY;

				// Disable manager flag
				this.manager.windowMoveInProgress = false;
			}
		}
	}

	render() {	// Called by the form manager after cycling
		// Check if wnd animations are playing
		if (this.windowAnimationPlayer.isPlaying) {
			// Draw window animations
			this.windowAnimationPlayer.render();
		} else {
			// Draw window if animation not in progress
			this.#renderWindow();
		}

		this.onRender();

		if (this.manager.mouseIsReleased && this.isOnTop && this.keepBehind && this.#lastActiveForm != null) {
			this.manager.bringFormToFront(this.#lastActiveForm);
		}

        // Check if help lines are enabled
        if (this.enableHelpLines) {
            stroke(255, 0, 0);
            noFill();

            // Render all help lines
            for (var i = 0; i < this.container.controls.length; i++) {
                var ctrl = this.container.controls[i];

                // Draw a box around each control
                rect(ctrl.absx, ctrl.absy, ctrl.w, ctrl.h);
            }

            noStroke();
        }
	}

	#renderWindow() {	// Renders the window and its contents
		push();
		translate(this.#x, this.#y);

		var rh = this.#minimizedH;

		// Draw the shadow
		fill(this.style.windowShadowColor);
		rect(this.style.windowShadowDistance, this.style.windowShadowDistance, this.#w, rh)

		// Draw the border
		fill(this.style.borderColor);
		rect(0, 0, this.#w, rh);

		// Draw title bar
		if (this.isOnTop) {
			fill(this.style.titleBarColor);
		} else {
			fill(this.style.inactiveTitleBarColor);
		}
		rect(this.borderWidth, this.borderWidth, this.titleBarWidth, this.titleBarHeight);

		// Draw title bar text
		if (textWidth(this.title) < this.titleBarWidth) {

			fill(this.style.titleBarFontColor);

			textAlign(LEFT, CENTER);
			textStyle(BOLD);

			text(this.title, 4 * this.borderWidth, this.borderWidth + this.titleBarHeight / 2 + 1);

			textAlign(LEFT, TOP);
			textStyle(NORMAL);
		}

		if (this.windowState != WND_STATE_MINIMIZED) {
			// Draw title bar icons and container
			this.container.render();
		}

		this.#renderTitleBarIcons();

		// If window is resizable draw resize field
		if (this.enableResizing) {
			image(WND_RESIZE_ICON, this.#resizeIconX, this.#resizeIconY);
		}

		pop();

		// Draw ghost if the window is being moved or resized
		if (this.moveInProgress || this.resizeInProgress) {
			this.#renderGhost();
		}
	}

	#renderGhost() {		// Renders the window ghost (used when resizing or moving wnd)
		stroke(this.style.ghostColor);
		strokeWeight(1);
		noFill();

		rect(this.#moveRectX, this.#moveRectY, this.#moveRectW, this.#moveRectH);

		noStroke();
	}

	#renderTitleBarIcons() {		// Renders title bar buttons and gives them actions

		// Change it so that imgs and rects are drawn by specifying their center point
		imageMode(CENTER);
		rectMode(RADIUS);

		for (var i = 0; i < this.#titleBarIcons.length; i++) {

			// Determine button location and radius
			var buttonX = this.#w - this.borderWidth - this.titleBarHeight / 2 - i * this.titleBarHeight;
			var buttonY = this.borderWidth + this.titleBarHeight / 2;
			var buttonRadius = this.titleBarHeight / 2 - 1;
			// Check if mouse hover
			if (this.manager.pointInsideBounds(this.mouseX, this.mouseY, buttonX - buttonRadius, buttonY - buttonRadius, 2 * buttonRadius, 2 * buttonRadius)) {

				// If mouse is pressed draw highlight
				if (this.mouseIsPressed) {
					fill(this.style.titleBarButtonColor);
					rect(buttonX, buttonY, buttonRadius);
				}

				// If mouse is released execute action
				if (this.mouseIsReleased) {
					var currentIcon = this.#titleBarIcons[i];

					if (currentIcon == WND_CLOSE_ICON) {
						this.manager.closeForm(this);
					} else if (currentIcon == WND_MAXIMIZE_ICON) {
						this.setWindowState(WND_STATE_MAXIMIZED);
					} else if (currentIcon == WND_RESTORE_ICON) {
						this.setWindowState(WND_STATE_NORMAL);
					} else if (currentIcon == WND_MINIMIZE_ICON) {
						this.setWindowState(WND_STATE_MINIMIZED);
					}
				}
			}

			// Draw title bar icon
			image(this.#titleBarIcons[i], buttonX, buttonY);
		}

		// Reset how imgs and rects are drawn
		imageMode(CORNER);
		rectMode(CORNER);
	}

	#updateMinimizedHeight(st) {	// Set minimized window height
		if (st == WND_STATE_MINIMIZED) {
			this.#minimizedH = this.titleBarHeight + 2 * this.borderWidth;
		} else {
			this.#minimizedH = this.#h;
		}
	}

	onShow() { }

	onClose() { }

	onRender() { }

	onResize() { }
}

class P5Cursor {
	image;

	constructor() {
		this.image = loadImage("p5forms_data/cursor.png");
	}

	render() {
		image(this.image, mouseX, mouseY);
	}
}

class P5WindowAnimation {
	#window;
	#frame = 0;
	isPlaying = false;

	#x; #y; #w; #h;
	#dx; #dy; #dw; #dh;

	#len = 0;

	constructor(window) {
		this.#window = window;
	}

	playAnimation(ix, iy, iw, ih, tx, ty, tw, th, len) {
		// Set animation rectangle bounds to starting bounds
		this.#x = ix;
		this.#y = iy;
		this.#w = iw;
		this.#h = ih;

		// Define steps for position and size
		this.#dx = (tx - ix) / len;
		this.#dy = (ty - iy) / len;
		this.#dw = (tw - iw) / len;
		this.#dh = (th - ih) / len;

		// Set length
		this.#len = len;

		// Reset frame counter
		this.#frame = 0;

		// Set animation playing flag
		this.isPlaying = true;
	}

	render() {
		// Check if an animation is playimg
		if (this.isPlaying) {
			// Increase position and size by steps defined earlier
			this.#x += this.#dx;
			this.#y += this.#dy;
			this.#w += this.#dw;
			this.#h += this.#dh;

			// Draw the ghost
			stroke(this.#window.style.ghostColor);
			noFill();

			rect(this.#x, this.#y, this.#w, this.#h);

			noStroke();

			// Increase frame counter
			this.#frame++;

			// End animation if final frame reached
			this.isPlaying = (this.#frame != this.#len);
		}
	}
}