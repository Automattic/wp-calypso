const sourceSiteId = 174455321; // dotcompatterns
const patternPreviewUrl =
	'https://public-api.wordpress.com/wpcom/v2/block-previews/pattern?stylesheet=pub/blank-canvas&pattern_id=';

const getPatternPreviewUrl = ( id: number ) => `${ patternPreviewUrl }${ id }-${ sourceSiteId }`;

// Runs the callbakc if the keys Enter or Spacebar are in the keyboard event
const handleKeyboard =
	( callback: () => void ) =>
	( { key }: { key: string } ) => {
		if ( key === 'Enter' || key === ' ' ) callback();
	};

export { getPatternPreviewUrl, handleKeyboard };
