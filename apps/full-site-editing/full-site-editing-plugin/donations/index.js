/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';

/**
 * Style dependencies
 */
import './style.scss';

const name = 'a8c/donations';

const settings = {
	title: __( 'Donations (a8c-only)', 'full-site-editing' ),
	description: __(
		'Collect one-time, monthly, or annually recurring donations.',
		'full-site-editing'
	),
	attributes: {
		currency: {
			type: 'string',
			default: 'USD',
		},
		oneTimePlanId: {
			type: 'number',
			default: null,
		},
		monthlyPlanId: {
			type: 'number',
			default: null,
		},
		annuallyPlanId: {
			type: 'number',
			default: null,
		},
		showCustomAmount: {
			type: 'boolean',
			default: true,
		},
		oneTimeHeading: {
			type: 'string',
			default: __( 'Make a one-time donation', 'full-site-editing' ),
		},
		monthlyHeading: {
			type: 'string',
			default: __( 'Make a monthly donation', 'full-site-editing' ),
		},
		annualHeading: {
			type: 'string',
			default: __( 'Make a yearly donation', 'full-site-editing' ),
		},
		chooseAmountText: {
			type: 'string',
			default: __( 'Choose an amount (USD)', 'full-site-editing' ),
		},
		customAmountText: {
			type: 'string',
			default: __( 'Or enter a custom amount', 'full-site-editing' ),
		},
		extraText: {
			type: 'string',
			default: __( 'Your contribution is appreciated.', 'full-site-editing' ),
		},
		oneTimeButtonText: {
			type: 'string',
			default: __( 'Donate', 'full-site-editing' ),
		},
		monthlyButtonText: {
			type: 'string',
			default: __( 'Donate monthly', 'full-site-editing' ),
		},
		annualButtonText: {
			type: 'string',
			default: __( 'Donate yearly', 'full-site-editing' ),
		},
	},
	category: 'widgets',
	icon: (
		<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12.7439 14.4271L8.64053 13.165L8.51431 13.8718L8.09208 20.7415C8.06165 21.2365 8.61087 21.5526 9.02363 21.2776L12.7439 18.799L16.7475 21.304C17.1687 21.5676 17.7094 21.2343 17.6631 20.7396L17.0212 13.8718L17.0212 13.165L12.7439 14.4271Z"
				fill="black"
			/>
			<circle cx="12.7439" cy="8.69796" r="5.94466" stroke="black" strokeWidth="1.5" fill="none" />
			<path
				d="M9.71023 8.12461L11.9543 10.3687L15.7776 6.54533"
				stroke="black"
				strokeWidth="1.5"
				fill="none"
			/>
		</svg>
	),
	supports: {
		html: false,
	},
	edit,
	save: () => null,
};

/**
 * Appends a "paid" tag to the Donations block title if site requires an upgrade.
 */
const addPaidBlockFlags = async () => {
	let membershipsStatus;
	try {
		membershipsStatus = await apiFetch( { path: '/wpcom/v2/memberships/status' } );
	} catch {
		// Do not add any flag if request fails.
		return;
	}
	const shouldUpgrade = membershipsStatus.should_upgrade_to_access_memberships;
	if ( shouldUpgrade ) {
		const donationsBlock = getBlockType( name );
		if ( ! donationsBlock ) {
			return;
		}

		const paidFlag = _x(
			'paid',
			'Short label appearing near a block requiring a paid plan',
			'full-site-editing'
		);

		unregisterBlockType( name );
		registerBlockType( name, {
			...donationsBlock,
			title: `${ donationsBlock.title } (${ paidFlag })`,
		} );
	}
};

function registerDonationsBlock() {
	registerBlockType( name, settings );

	// Done after registration so the status API request doesn't suspend the execution.
	addPaidBlockFlags();
}

registerDonationsBlock();
