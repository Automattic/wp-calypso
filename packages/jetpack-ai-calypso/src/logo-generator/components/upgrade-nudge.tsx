/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, warning } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { EVENT_PLACEMENT_UPGRADE_PROMPT, EVENT_UPGRADE } from '../../constants';
import { useCheckout } from '../hooks/use-checkout';
import useLogoGenerator from '../hooks/use-logo-generator';
import './upgrade-nudge.scss';

export const UpgradeNudge = () => {
	const buttonText = __( 'Upgrade', 'jetpack' );
	const upgradeMessage = createInterpolateElement(
		__(
			'Not enough requests left to generate a logo. <strong>Upgrade now to increase it.</strong>',
			'jetpack'
		),
		{
			strong: <strong />,
		}
	);

	const { nextTierCheckoutURL: checkoutUrl } = useCheckout();
	const { context } = useLogoGenerator();

	const handleUpgradeClick = () => {
		recordTracksEvent( EVENT_UPGRADE, { context, placement: EVENT_PLACEMENT_UPGRADE_PROMPT } );
	};

	return (
		<div className="jetpack-upgrade-plan-banner">
			<div className="jetpack-upgrade-plan-banner__wrapper">
				<div>
					<Icon className="jetpack-upgrade-plan-banner__icon" icon={ warning } />
					<span className="jetpack-upgrade-plan-banner__banner-description">
						{ upgradeMessage }
					</span>
				</div>
				<Button
					href={ checkoutUrl }
					target="_blank"
					className="is-primary"
					onClick={ handleUpgradeClick }
				>
					{ buttonText }
				</Button>
			</div>
		</div>
	);
};
