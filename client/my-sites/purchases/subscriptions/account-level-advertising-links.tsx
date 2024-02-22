import { isEnabled } from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function AccountLevelAdvertisingLinks() {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const adminInterface = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'wpcom_admin_interface' )
	);

	if ( ! shouldShowAdvertisingOption || ! selectedSiteSlug ) {
		return null;
	}

	const advertisingUrl =
		adminInterface === 'wp-admin' && isEnabled( 'layout/dotcom-nav-redesign' )
			? `https://${ selectedSiteSlug }/wp-admin/tools.php?page=advertising`
			: `/advertising/${ selectedSiteSlug }`;

	return (
		<>
			<CompactCard href={ advertisingUrl }>
				{ translate( 'View advertising campaigns' ) }
			</CompactCard>
		</>
	);
}
