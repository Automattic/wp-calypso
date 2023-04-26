import { useTranslate } from 'i18n-calypso';

const useAutomatticBrandingNoun = () => {
	const translate = useTranslate();
	const automatticRoger = [
		translate( 'An Automattic brainchild' ),
		translate( 'An Automattic contraption' ),
		translate( 'An Automattic creation' ),
		translate( 'An Automattic experiment' ),
		translate( 'An Automattic invention' ),
		translate( 'An Automattic joint' ),
		translate( 'An Automattic medley' ),
		translate( 'An Automattic opus' ),
		translate( 'An Automattic production' ),
		translate( 'An Automattic ruckus' ),
		translate( 'An Automattic thingamajig' ),
	];

	const branding = automatticRoger[ Math.floor( Math.random() * ( 10 - 0 + 1 ) + 0 ) ];

	return {
		article: branding.split( 'Automattic' )[ 0 ],
		noun: branding.split( 'Automattic' )[ 1 ],
	};
};

export default useAutomatticBrandingNoun;
