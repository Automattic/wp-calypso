import { useTranslate } from 'i18n-calypso';

const OdieStrings = () => {
	const translate = useTranslate();
	translate( 'Chat' );
};

if ( window.Odie ) {
	window.Odie.strings = OdieStrings;
}
