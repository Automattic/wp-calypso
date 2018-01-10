/** @format */

export function insertMediaAsLink( editor, media ) {
	const mediaUrl = media.URL;
	const title = media.title.replace( /"/g, '&quot;' );
	editor.execCommand(
		'mceReplaceContent',
		false,
		`<a href="${ mediaUrl }"
			title="${ title }">{$selection}</a>`
	);
}

export function insertMedia( editor, markup ) {
	editor.execCommand( 'mceInsertContent', false, markup );
}
