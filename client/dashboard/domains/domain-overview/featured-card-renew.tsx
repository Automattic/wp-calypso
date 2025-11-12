import { Domain } from '@automattic/api-core';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
import { purchaseSettingsRoute } from '../../app/router/me';
import OverviewCard from '../../components/overview-card';
import { formatDate } from '../../utils/datetime';

interface Props {
	domain: Domain;
}

export default function FeaturedCardRenew( { domain }: Props ) {
	const router = useRouter();
	const locale = useLocale();
	const date = domain.auto_renewing ? domain.auto_renewal_date : domain.expiry;

	if ( ! date || domain.subscription_id === null ) {
		return null;
	}

	let intent: 'error' | 'success' | 'warning' | 'upsell' = 'warning';

	if ( domain.expired ) {
		intent = 'error';
	} else if ( domain.auto_renewing ) {
		intent = 'success';
	}

	const formattedDate = formatDate( new Date( date ), locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	} );

	return (
		<OverviewCard
			title={ domain.auto_renewing ? __( 'Renews' ) : __( 'Expires' ) }
			heading={ formattedDate }
			icon={ <Icon icon={ calendar } /> }
			link={
				router.buildLocation( {
					to: purchaseSettingsRoute.fullPath,
					params: { purchaseId: domain.subscription_id },
				} ).href
			}
			description={
				domain.auto_renewing ? __( 'Auto-renew is enabled.' ) : __( 'Auto-renew is disabled.' )
			}
			intent={ intent }
		/>
	);
}
