import { useTranslate } from 'i18n-calypso';

const GlobalStylesTemporaryStrings = () => {
	const translate = useTranslate();
	translate( "Change all of your site's fonts, colors and more. Available on the Personal plan." );
	translate( "Change all of your site's fonts, colors and more. Available on the Premium plan." );
};

if ( window.DummyVariable ) {
	window.DummyVariable.strings = GlobalStylesTemporaryStrings;
}
