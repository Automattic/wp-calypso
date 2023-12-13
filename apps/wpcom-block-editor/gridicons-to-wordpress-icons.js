// Map of Gridicon names to WordPress Icon names.
const ICON_NAME_MAP = {
	checkmark: 'check',
	cross: 'close',
};

/**
 * This custom loader is used to replace Gridicons with WordPress Icons.
 */
module.exports = function ( source ) {
	const iconImports = [];

	let newSource = source;

	newSource = source.replace(
		/<Gridicon\s+(?:icon="([^"]+)"\s+)?(?:size={([^}]+)}\s+)?\/>/g,
		( match, iconName, iconSize ) => {
			if ( ! ICON_NAME_MAP[ iconName ] ) {
				return match;
			}
			const wpIconName = ICON_NAME_MAP[ iconName ];
			const wpIconNameWithPrefix = `wordPressIcon_${ ICON_NAME_MAP[ iconName ] }`;
			if ( ! iconImports.some( ( i ) => i === iconName ) ) {
				iconImports.push( `${ wpIconName } as ${ wpIconNameWithPrefix }` );
			}
			return `<WordPressIcon icon={${ wpIconNameWithPrefix }} size={${ iconSize }} className="gridicon" />`;
		}
	);

	if ( ! newSource.includes( '@wordpress/icons' ) ) {
		newSource =
			`import { Icon as WordPressIcon, ${ iconImports.join( ',' ) } } from '@wordpress/icons';\n` +
			newSource;
	}

	return newSource;
};
