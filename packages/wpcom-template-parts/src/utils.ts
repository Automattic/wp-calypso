import { translate as translateMethod } from 'i18n-calypso';

export const getAutomatticBrandingNoun = ( translate: typeof translateMethod ) => {
	const AutomatticBrand = 'Automattic';
	const options = {
		description:
			'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		args: { Automattic: AutomatticBrand },
	};
	const automatticRoger = [
		translate( 'An %(Automattic)s brainchild', options ),
		translate( 'An %(Automattic)s contraption', options ),
		translate( 'An %(Automattic)s creation', options ),
		translate( 'An %(Automattic)s experiment', options ),
		translate( 'An %(Automattic)s invention', options ),
		translate( 'An %(Automattic)s joint', options ),
		translate( 'An %(Automattic)s medley', options ),
		translate( 'An %(Automattic)s opus', options ),
		translate( 'An %(Automattic)s production', options ),
		translate( 'An %(Automattic)s ruckus', options ),
		translate( 'An %(Automattic)s thingamajig', options ),
	];

	const branding = automatticRoger[ Math.floor( Math.random() * ( 10 - 0 + 1 ) + 0 ) ]?.toString();

	return {
		prefix: branding.split( 'Automattic' )[ 0 ],
		suffix: branding.split( 'Automattic' )[ 1 ],
	};
};
