import { useTranslate } from 'i18n-calypso';

const GlobalStylesTemporaryStrings = () => {
	const translate = useTranslate();
	translate(
		'Your site includes <a href="%s" target="_blank">customized styles</a> that are only visible to visitors after upgrading to the Personal plan or higher.',
		{
			comment: '%s - documentation URL.',
		}
	);
	translate(
		'Your site includes <a href="%s" target="_blank">customized styles</a> that are only visible to visitors after upgrading to the Premium plan or higher.',
		{
			comment: '%s - documentation URL.',
		}
	);
	translate(
		'Your site includes customized styles that are only visible to visitors after <a>upgrading to the Personal plan or higher</a>.'
	);
	translate(
		'Your site includes customized styles that are only visible to visitors after <a>upgrading to the Premium plan or higher</a>.'
	);
	translate(
		'Your site includes customized styles that are only visible to visitors after upgrading to the Personal plan or higher.'
	);
	translate(
		'Your site includes customized styles that are only visible to visitors after upgrading to the Premium plan or higher.'
	);
};

if ( window.DummyVariable ) {
	window.DummyVariable.strings = GlobalStylesTemporaryStrings;
}
