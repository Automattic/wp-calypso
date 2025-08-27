import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { unseen } from '@wordpress/icons';
import { Domain } from '../../data/domain';
import OverviewCard from '../../sites/overview-card';

interface Props {
	domain: Domain;
}

export default function FeaturedCardPrivacy( { domain }: Props ) {
	return (
		<OverviewCard
			title={ __( 'Privacy' ) }
			heading={ __( 'WHOIS Privacy' ) }
			icon={ <Icon icon={ unseen } /> }
			description={ domain.privacy_available ? __( 'Enabled' ) : __( 'Disabled' ) }
		/>
	);
}
