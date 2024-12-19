import { useTranslate } from 'i18n-calypso';

const NoResults = () => {
	const translate = useTranslate();

	return <span>{ translate( 'No themes matched.' ) }</span>;
};

export default NoResults;
