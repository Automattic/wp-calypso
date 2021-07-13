( function () {
	const customizerGlobalStylesBlockEditorLinkElem = window.parent.document.getElementById(
		'customizer_global_styles_block_editor_link'
	);
	if ( customizerGlobalStylesBlockEditorLinkElem ) {
		customizerGlobalStylesBlockEditorLinkElem.onclick = function () {
			window.parent.window._tkq = window.parent.window._tkq || [];
			window.parent.window._tkq.push( [
				'recordEvent',
				'calypso_customizer_global_styles_block_editor_link_clicked',
			] );
		};
	}
	const customizerGlobalStylesSupportLinkElem = window.parent.document.getElementById(
		'customizer_global_styles_support_link'
	);
	if ( customizerGlobalStylesSupportLinkElem ) {
		customizerGlobalStylesSupportLinkElem.onclick = function () {
			window.parent.window._tkq = window.parent.window._tkq || [];
			window.parent.window._tkq.push( [
				'recordEvent',
				'calypso_customizer_global_styles_support_link_clicked',
			] );
		};
	}
} )();
