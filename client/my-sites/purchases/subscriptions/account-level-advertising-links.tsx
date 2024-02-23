import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import useAdvertisingUrl from 'calypso/my-sites/advertising/useAdvertisingUrl';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function AccountLevelAdvertisingLinks() {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;
	const advertisingUrl = useAdvertisingUrl();

	if ( ! shouldShowAdvertisingOption || ! selectedSiteSlug ) {
		return null;
	}

	return (
		<>
			<CompactCard href={ advertisingUrl }>
				{ translate( 'View advertising campaigns' ) }
			</CompactCard>
		</>
	);
}
