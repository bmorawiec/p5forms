var orderingForm, historyForm, themesForm, debugForm;
var debugCanvas, debugLabel;
var rot = 0;
var formManager;
var cityFormStyle, cityControlStyle;
var formCursor;

function preload() {
	cityFormStyle = new P5FormStyle();
	cityControlStyle = new P5ControlStyle();
	formCursor = new P5Cursor();
	formManager = new P5FormManager();

	cityFormStyle.borderColor = color(255, 70, 0);

	cityFormStyle.inactiveTitleBarColor =
		cityFormStyle.titleBarButtonColor =
		cityFormStyle.titleBarColor = 
		cityFormStyle.ghostColor = color(0, 161, 255);

	cityFormStyle.titleBarFontColor = color(255);

	cityFormStyle.windowShadowColor = color(0, 161, 255, 150);

	cityControlStyle.buttonClickedBorderColor =
		cityControlStyle.listBoxSelectedColor = 
		cityControlStyle.checkBoxCheckColor =
		cityControlStyle.listBoxBorderColor =
		cityControlStyle.textBoxBorderColor =
		cityControlStyle.buttonBorderColor = color(0, 161, 255);

	cityControlStyle.buttonTextColor =
		cityControlStyle.buttonClickedColor = color(255, 70, 0);

}

function setup() {
	resizeCanvas(960, 540, P2D);
	noCursor();

	var orderConfirmation_close = function(button) {
		if (button == "Yes") {
			msgbox.showMsgBox(orderingForm, "Order info", "Your order has been confirmed!",	MSGBOX_INFO_ICON, ["OK"], null);

			historyListBox.items.push(amountTextBox.text + " cookies | ID: " + (historyListBox.items.length + 1));

			if (attachNotesCheckBox.checked) {
				historyListBox.items[historyListBox.items.length - 1] = historyListBox.items[historyListBox.length - 1]	+ " | NOTES: " + notesTextBox.text;
			}
		} else {
			msgbox.showMsgBox(orderingForm, "Order info", "Your order has been canceled!", MSGBOX_STOP_ICON, ["OK"], null);
		}
	}

	var cookiesButton_onClick = function() {
		if (amountTextBox.text == "") {
			msgbox.showMsgBox(orderingForm, "Warning", "Please enter the amount of cookies that you would like to order", MSGBOX_WARN_ICON, ["OK"], null);
		} else {
			msgbox.showMsgBox(orderingForm, "Question",
				"Your order for " + amountTextBox.text + " cookies has been placed! Would you like to confirm it?", MSGBOX_QUESTION_ICON, ["No", "Yes"], orderConfirmation_close);
		}
	};

	var prevOrdersButton_onClick = function() {
		formManager.showForm(historyForm);
	}

	var themeButton_onClick = function() {
		formManager.showForm(themesForm);
	}

	var cityThemeButton_onClick = function() {
		formManager.windowStyle = cityFormStyle;
		formManager.controlStyle = cityControlStyle;
	}

	var normalThemeButton_onClick = function() {
		formManager.windowStyle = DEFAULT_WINDOW_STYLE;
		formManager.controlStyle = DEFAULT_CONTROL_STYLE;
	}

	var removePreviousOrderButton_onClick = function() {
		historyListBox.items.splice(historyListBox.selectedItem, 1);
	}

	var addDebugItemButton_onClick = function() {
		historyListBox.items.push("THIS_IS_A_DEBUG_ITEM_A_DEBUG_ITEM_THIS_IS");
	}

	var debugButton_onClick = function() {
		formManager.showForm(debugForm);
	}

	var msgbox = new P5MsgBox();

	orderingForm = new P5Form();
	orderingForm.title = "Cookie ordering form";
	orderingForm.minw = orderingForm.w = 220;
	orderingForm.minh = orderingForm.h = 205;
	orderingForm.x = 400;
	orderingForm.y = 240;

	var orderingInfoLabel = new P5Label();
	orderingInfoLabel.text = "Use this form to order cookies!\n\n" +
		"Amount wanted:";
	orderingInfoLabel.w = 210;
	orderingInfoLabel.h = 50;
	orderingInfoLabel.anchorRight = true;

	var cookiesButton = new P5Button();
	cookiesButton.anchorRight = true;
	cookiesButton.text = "Order cookies";
	cookiesButton.x = 5;
	cookiesButton.y = 90;
	cookiesButton.w = 205;
	cookiesButton.onClick = cookiesButton_onClick;

	var prevOrdersButton = new P5Button();
	prevOrdersButton.anchorRight = true;
	prevOrdersButton.text = "My previous orders";
	prevOrdersButton.x = 5;
	prevOrdersButton.y = 120;
	prevOrdersButton.w = 205;
	prevOrdersButton.onClick = prevOrdersButton_onClick;

	var themeButton = new P5Button();
	themeButton.anchorRight = true;
	themeButton.text = "Change form theme";
	themeButton.x = 5;
	themeButton.y = 150;
	themeButton.w = 205;
	themeButton.onClick = themeButton_onClick;

	var debugButton = new P5Button();
	debugButton.anchorRight = true;
	debugButton.text = "Show canvas form";
	debugButton.x = 5;
	debugButton.y = 180;
	debugButton.w = 205;
	debugButton.onClick = debugButton_onClick;

	var attachNotesCheckBox = new P5CheckBox();
	attachNotesCheckBox.x = 5;
	attachNotesCheckBox.y = 60;
	attachNotesCheckBox.w = 90
	attachNotesCheckBox.h = 16;
	attachNotesCheckBox.text = "Notes:";

	var amountTextBox = new P5TextBox();
	amountTextBox.anchorRight;
	amountTextBox.maxLength = 3;
	amountTextBox.numOnly = true;
	amountTextBox.x = 100;
	amountTextBox.y = 25;

	var notesTextBox = new P5TextBox();
	notesTextBox.anchorRight = true;
	notesTextBox.multiline = true;
	notesTextBox.x = 100;
	notesTextBox.y = 55;
	notesTextBox.w = 110;

	orderingForm.container.toolTip.addToolTip(notesTextBox, "Add delivery notes to your order");
	orderingForm.container.toolTip.addToolTip(cookiesButton, "Start the order process");

	orderingForm.container.addControl(orderingInfoLabel);
	orderingForm.container.addControl(cookiesButton);
	orderingForm.container.addControl(prevOrdersButton);
	orderingForm.container.addControl(amountTextBox);
	orderingForm.container.addControl(notesTextBox);
	orderingForm.container.addControl(themeButton);
	orderingForm.container.addControl(attachNotesCheckBox);

	historyForm = new P5Form();
	historyForm.title = "Previous orders";
	historyForm.container.backColor = color(255, 255, 200);
	historyForm.minw = historyForm.w = 205;
	historyForm.minh = historyForm.h = 220;

	var historyInfoLabel = new P5Label();
	historyInfoLabel.text = "You can view your previous orders on this list";
	historyInfoLabel.anchorRight = true;
	historyInfoLabel.w = 190
	historyInfoLabel.h = 30;

	var historyListBox = new P5ListBox();
	historyListBox.anchorRight = true;
	historyListBox.anchorBottom = true;
	historyListBox.x = 5;
	historyListBox.y = 50;
	historyListBox.w = 190;
	historyListBox.h = 110;

	var removePreviousOrderButton = new P5Button();
	removePreviousOrderButton.text = "Remove";
	removePreviousOrderButton.anchorBottom = true;
	removePreviousOrderButton.anchorTop = false;
	removePreviousOrderButton.x = 5;
	removePreviousOrderButton.y = 165;
	removePreviousOrderButton.onClick = removePreviousOrderButton_onClick;

	var addDebugItemButton = new P5Button();
	addDebugItemButton.text = "Debug item";
	addDebugItemButton.anchorBottom = true;
	addDebugItemButton.anchorRight = true;
	addDebugItemButton.anchorTop = false;
	addDebugItemButton.x = 90;
	addDebugItemButton.y = 165;
	addDebugItemButton.onClick = addDebugItemButton_onClick;

	historyForm.container.addControl(historyInfoLabel);
	historyForm.container.addControl(historyListBox);
	historyForm.container.addControl(removePreviousOrderButton);

	themesForm = new P5Form();
	themesForm.title = "Themes";
	themesForm.w = 180;
	themesForm.h = 60;
	themesForm.removeWindowIcon(WND_MAXIMIZE_ICON);
	themesForm.enableResizing = false;

	var normalThemeButton = new P5Button();
	normalThemeButton.text = "Classic";
	normalThemeButton.onClick = normalThemeButton_onClick;

	var cityThemeButton = new P5Button();
	cityThemeButton.text = "CITY";
	cityThemeButton.x = 90;
	cityThemeButton.y = 5;
	cityThemeButton.onClick = cityThemeButton_onClick;

	themesForm.container.addControl(normalThemeButton);
	themesForm.container.addControl(cityThemeButton);

	debugForm = new P5Form();
	debugForm.title = "3D Canvas";
	debugForm.w = 500;
	debugForm.h = 350;
	debugForm.x = 50;
	debugForm.y = 50;

	debugCanvas = new P5Canvas();
	debugCanvas.canvasRenderer = WEBGL;
	debugCanvas.w = 500 - 2 * debugForm.borderWidth;
	debugCanvas.h = 350 - 2 * debugForm.borderWidth - debugForm.titleBarHeight;
	debugCanvas.x = debugCanvas.y = 0;
	debugCanvas.anchorRight = debugCanvas.anchorBottom = true;

	debugLabel = new P5Label();

	debugForm.container.addControl(debugCanvas);
	debugForm.container.addControl(debugLabel);createCanvas(1280, 720, P2D);

	// Create a canvas clear function
	var clearCanvas = function() {	
		// Get the drawing surface
		var c = canv.canvas;
	
		// Render a white background
		c.background(255);
	
		// Disable fill
		c.noFill();
	}
	
	// Create a function for drawing a triangle
	var drawTriangle = function() {
		// Get the drawing surface
		var c = canv.canvas;
	
		// Get the size
		var sz = parseInt(sizeTextBox.text);
	
		// Draw a triangle
		c.triangle(sz / 2, 0, sz, sz, 0, sz);
	}
	
	// Create a function for drawing a rectangle
	var drawRect = function() {
		// Get the drawing surface
		var c = canv.canvas;
	
		// Get the size
		var sz = parseInt(sizeTextBox.text);
	
		// Draw a rectangle
		c.rect(0, 0, sz, sz);
	}
	
	// Create a function for drawing a circle
	var drawCircle = function() {
		// Get the drawing surface
		var c = canv.canvas;
	
		// Get the size
		var sz = parseInt(sizeTextBox.text);
	
		// Draw a rectangle
		c.circle(sz / 2, sz / 2, sz);
	}
	
	// Create the GUI
	
	var drawingForm = new P5Form();
	
	drawingForm.x = 650;
	drawingForm.y = 50;
	drawingForm.w = 500;
	drawingForm.h = 300;
	drawingForm.container.backColor = color(230, 255, 230);
	drawingForm.title = "Draw!";
	
	var canv = new P5Canvas();
	canv.w = 290;
	canv.h = 250;
	canv.x = 200;
	
	var triangleButton = new P5Button();
	
	triangleButton.w = 185;
	triangleButton.text = "Draw triangle"
	triangleButton.onClick = drawTriangle;
	
	var rectButton = new P5Button();
	
	rectButton.y = 35;
	rectButton.w = 185;
	rectButton.text = "Draw rectangle"
	rectButton.onClick = drawRect;
	
	var circleButton = new P5Button();
	
	circleButton.y = 65;
	circleButton.w = 185;
	circleButton.text = "Draw circle"
	circleButton.onClick = drawCircle;
	
	var clearButton = new P5Button();
	
	clearButton.y = 95;
	clearButton.w = 185;
	clearButton.text = "Clear canvas";
	clearButton.onClick = clearCanvas;
	
	var sizeLabel = new P5Label();
	
	sizeLabel.text = "Size (px)";
	sizeLabel.y = 140;
	
	var sizeTextBox = new P5TextBox();
	sizeTextBox.x = 100;
	sizeTextBox.y = 130;
	sizeTextBox.w = 90;
	sizeTextBox.text = "100";
	sizeTextBox.numOnly = true;
	
	drawingForm.container.addControl(canv);	
	drawingForm.container.addControl(triangleButton);
	drawingForm.container.addControl(rectButton);
	drawingForm.container.addControl(circleButton);
	drawingForm.container.addControl(clearButton);
	drawingForm.container.addControl(sizeLabel);
	drawingForm.container.addControl(sizeTextBox);
	
	// Show the form
	formManager.showForm(drawingForm);
	
	// Clear the canvas
	clearCanvas();

	formManager.showForm(debugForm);
	formManager.showForm(orderingForm);
	formManager.showForm(drawingForm);

	windowResized();
}

function draw() {
	background(200);

	var c = debugCanvas.canvas;

	debugLabel.text = debugCanvas.mouseX + ";" + debugCanvas.mouseY + "\n(" + c.width + " x " + c.height + ")";

	c.noFill();
	c.stroke(1);

	c.clear();
	c.background(200);

	c.push();

	c.rotateX(rot);
	c.rotateY(rot * 2);
	c.rotateZ(rot * 3);
	c.box(100);

	c.pop();

	rot += 0.01;

	formManager.renderForms();
	formCursor.render();
}

function keyPressed() {
	formManager.keyPressed();
}

function keyReleased() {
	formManager.keyReleased();
}

function windowResized() {
	createCanvas(document.body.clientWidth, 500);
}

window.onresize = windowResized();