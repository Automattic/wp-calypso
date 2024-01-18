import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, warning } from '@wordpress/icons';

import './upgrade-nudge.scss';

export const UpgradeNudge = () => {
	const buttonText = __( 'Upgrade', 'jetpack' );
	const checkoutUrl = 'https://wordpress.com/';

	return (
		<div className="jetpack-upgrade-plan-banner">
			<div className="jetpack-upgrade-plan-banner__wrapper">
				<div>
					<Icon className="jetpack-upgrade-plan-banner__icon" icon={ warning } />
					<span className="jetpack-upgrade-plan-banner__banner-description">
						You reached your plan request limit. <strong>Upgrade now to increase it.</strong>
					</span>
				</div>
				<Button href={ checkoutUrl } target="_top" className="is-primary">
					{ buttonText }
				</Button>
			</div>
		</div>
	);
};
