import { Domain } from '@automattic/api-core';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
import OverviewCard from '../../components/overview-card';
import { getPurchaseUrlForId } from '../../me/billing-purchases/urls';
import { formatDate } from '../../utils/datetime';

interface Props {
	domain: Domain;
}

export default function FeaturedCardRenew( { domain }: Props ) {
	const locale = useLocale();
	const date = domain.auto_renewing ? domain.auto_renewal_date : domain.expiry;

	if ( ! date || domain.subscription_id === null ) {
		return null;
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
			link={ getPurchaseUrlForId( domain.subscription_id ) }
			description={
				domain.auto_renewing ? __( 'Auto-renew is enabled.' ) : __( 'Auto-renew is disabled.' )
			}
		/>
	);
}
