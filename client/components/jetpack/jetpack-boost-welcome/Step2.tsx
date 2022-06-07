import { useTranslate } from 'i18n-calypso';

export const Step2 = () => {
	const translate = useTranslate();

	return <p>{ translate( 'That’s it! Boost will automatically begin optimizing your site.' ) }</p>;
};
