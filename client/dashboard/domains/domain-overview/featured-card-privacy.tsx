import { Domain } from '@automattic/api-core';
import { PRIVACY_PROTECTION } from '@automattic/urls';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { seen, unseen } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import { useTrackOverviewItem } from './use-track-overview-item';

interface FeaturedCardPrivacyProps {
	domain: Domain;
	isDisabled?: boolean;
}

export default function FeaturedCardPrivacy( { domain, isDisabled }: FeaturedCardPrivacyProps ) {
	const trackItem = useTrackOverviewItem( domain );
	const privacyWarning = __(
		'Privacy protection is not available due to the registry’s policies.'
	);
	const privacyProtectionNote = domain.private_domain ? __( 'Enabled' ) : __( 'Disabled' );
	const contactInfoLink =
		domain.current_user_can_manage && domain.privacy_available && ! isDisabled
			? `/domains/${ domain.domain }/contact-info`
			: undefined;

	return (
		<OverviewCard
			disabled={ isDisabled }
			title={ __( 'Privacy' ) }
			heading={ __( 'WHOIS Privacy' ) }
			icon={ <Icon icon={ domain.private_domain ? unseen : seen } /> }
			link={ contactInfoLink }
			externalLink={ ! domain.privacy_available ? PRIVACY_PROTECTION : undefined }
			description={ ! domain.privacy_available ? privacyWarning : privacyProtectionNote }
			intent={ domain.private_domain ? 'success' : 'warning' }
			// OverviewCard turns a card with `onClick` and no link into a button.
			onClick={
				contactInfoLink || ! domain.privacy_available ? () => trackItem( 'privacy' ) : undefined
			}
		/>
	);
}
