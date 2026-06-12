import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import { notificationsExtrasRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export const NotificationsExtrasSummary = ( { density }: { density?: Density } ) => {
	return (
		<RouterLinkSummaryButton
			density={ density }
			to={ notificationsExtrasRoute.fullPath }
			title={ __( 'Extras' ) }
			description={ __(
				'Get curated extras like reports, digests, and community updates, so you can stay tuned for what’s happening in the WordPress ecosystem.'
			) }
			decoration={ <Icon icon={ starEmpty } /> }
		/>
	);
};
