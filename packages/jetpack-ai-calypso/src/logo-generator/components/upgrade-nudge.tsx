/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, warning } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import './upgrade-nudge.scss';

export const UpgradeNudge = () => {
	const buttonText = __( 'Upgrade', 'jetpack' );
	const checkoutUrl = 'https://wordpress.com/';
	const upgradeMessage = createInterpolateElement(
		__(
			'You reached your plan request limit. <strong>Upgrade now to increase it.</strong>',
			'jetpack'
		),
		{
			strong: <strong />,
		}
	);

	return (
		<div className="jetpack-upgrade-plan-banner">
			<div className="jetpack-upgrade-plan-banner__wrapper">
				<div>
					<Icon className="jetpack-upgrade-plan-banner__icon" icon={ warning } />
					<span className="jetpack-upgrade-plan-banner__banner-description">
						{ upgradeMessage }
					</span>
				</div>
				<Button href={ checkoutUrl } target="_blank" className="is-primary">
					{ buttonText }
				</Button>
			</div>
		</div>
	);
};
