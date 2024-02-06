import { useTranslate } from 'i18n-calypso';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const SiteTransferred = () => {
	useQueryUserPurchases();
	const selectedSite = useSelector( getSelectedSite );

	const translate = useTranslate();

	// ToDo: Implement onBackClick
	// const onBackClick = () => {

	// };

	return <h1>Site Transferred screen</h1>;
};

export default SiteTransferred;
