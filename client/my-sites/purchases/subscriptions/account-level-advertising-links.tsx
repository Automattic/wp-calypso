import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function AccountLevelAdvertisingLinks() {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	return (
		<>
			<CompactCard href={ `/advertising/${ selectedSiteSlug }` }>
				{ translate( 'View advertising campaigns' ) }
			</CompactCard>
		</>
	);
}
