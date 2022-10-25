import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function AccountLevelAdvertisingLinks() {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	if ( ! shouldShowAdvertisingOption || ! selectedSiteSlug ) {
		return null;
	}

	return (
		<>
			<CompactCard href={ `/advertising/${ selectedSiteSlug }` }>
				{ translate( 'View advertising campaigns' ) }
			</CompactCard>
		</>
	);
}
