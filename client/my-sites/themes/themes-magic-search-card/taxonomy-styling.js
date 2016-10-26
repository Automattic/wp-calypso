/**
	* This is a helper file that establishes designed visual connection between
	* search taxonomy and its graphical representation.
	*/

const taxonomyToGridiconMap = {
	color: 'ink',
	column: 'align-justify',
	feature: 'customize',
	layout: 'layout',
	subject: 'info-outline',
	style: 'themes',
};

export function taxonomyToGridicon( taxonomy ) {
	if ( taxonomyToGridiconMap.hasOwnProperty( taxonomy ) ) {
		return taxonomyToGridiconMap[ taxonomy ];
	}
	return 'tag';
}
