import { useTranslate } from 'i18n-calypso';

export const Step2 = () => {
	const translate = useTranslate();

	return <p>{ translate( 'Connect your desired social media accounts.' ) }</p>;
};
