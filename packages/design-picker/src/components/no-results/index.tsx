import { useTranslate } from 'i18n-calypso';

const NoResults = () => {
	const translate = useTranslate();

	return <span>{ translate( 'No designs matched.' ) }</span>;
};

export default NoResults;
