import { __ } from '@wordpress/i18n';

export type SiteAction = 'renew' | 'cancel' | 'remove' | 'auto-renew';

export const SITE_ACTIONS: readonly SiteAction[] = [ 'renew', 'cancel', 'remove', 'auto-renew' ];

export const SITE_ACTION_TITLES: Record< SiteAction, string > = {
	renew: __( 'Renew subscriptions' ),
	cancel: __( 'Cancel subscriptions' ),
	remove: __( 'Remove upgrades' ),
	'auto-renew': __( 'Turn off auto-renew' ),
};
