import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
import { Domain } from '../../data/domain';
import OverviewCard from '../../sites/overview-card';
import { formatDate } from '../../utils/datetime';

interface Props {
	domain: Domain;
}

export default function FeaturedCardRenew( { domain }: Props ) {
	const locale = useLocale();
	const date = domain.auto_renewing ? domain.auto_renewal_date : domain.renewable_until;

	const formattedDate = formatDate( new Date( date ), locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	} );

	return (
		<OverviewCard
			title={ __( 'Renews' ) }
			heading={ formattedDate }
			icon={ <Icon icon={ calendar } /> }
			link={ `/me/billing/purchases/purchase/${ domain.subscription_id }` }
			description={
				domain.auto_renewing ? __( 'Auto-renew is enabled.' ) : __( 'Auto-renew is disabled.' )
			}
		/>
	);
}
