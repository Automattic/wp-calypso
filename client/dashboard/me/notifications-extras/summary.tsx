import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export const NotificationsExtrasSummary = () => {
	return (
		<RouterLinkSummaryButton
			to="/me/notifications/extras"
			title={ __( 'Extras' ) }
			description={ __(
				'Get curated extras like reports, digests, and community updates, so you can stay tuned for what’s happening in the WordPress ecosystem.'
			) }
			decoration={ <Icon icon={ starEmpty } /> }
		/>
	);
};
