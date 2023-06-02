function recordTracksEvent( tracksEventName ) {
	window.parent.window._tkq = window.parent.window._tkq || [];
	if ( window.tracks_events_fonts_section_control_variables.user_id ) {
		window.parent.window._tkq.push( [
			'identifyUser',
			Number( window.tracks_events_fonts_section_control_variables.user_id ),
			`${ window.tracks_events_fonts_section_control_variables.user_login }`,
		] );
	}
	window.parent.window._tkq.push( [ 'recordEvent', tracksEventName ] );
}
const customizerGlobalStylesBlockEditorLinkElem = window.parent.document.getElementById(
	'customizer_global_styles_block_editor_link'
);
if ( customizerGlobalStylesBlockEditorLinkElem ) {
	customizerGlobalStylesBlockEditorLinkElem.onclick = function () {
		recordTracksEvent( 'calypso_customizer_global_styles_block_editor_link_clicked' );
	};
}
const customizerGlobalStylesSupportLinkElem = window.parent.document.getElementById(
	'customizer_global_styles_support_link'
);
if ( customizerGlobalStylesSupportLinkElem ) {
	customizerGlobalStylesSupportLinkElem.onclick = function () {
		recordTracksEvent( 'calypso_customizer_global_styles_support_link_clicked' );
	};
}
