highlight
=========

This module searches a given html string and wraps all matching strings with a `<mark>` or custom elements.

If you give a custom element, it will be cloned every time it is added via `cloneNode()`

# How to use

	var html = '<div>hello world</div>';
	var highlighted = highlight( 'hello', html );
	// <div><mark>hello</mark> world</div>
	
	var customWrapper = document.createElement('span');
	customWrapper.setAttribute( 'class', 'my-wrapper' );
	var customHighlighted = highlight( 'hello', html, customWrapper );
	// <div><span class="my-wrapper">hello</span> world</div>
