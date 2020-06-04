/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { __, _x } from '@wordpress/i18n';
/* eslint-enable wpcalypso/import-docblock */

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
		const donationsBlock = getBlockType( 'a8c/donations' );
		if ( ! donationsBlock ) {
			return;
		}

		const paidFlag = _x(
			'paid',
			'Short label appearing near a block requiring a paid plan',
			'premium-content'
		);

		unregisterBlockType( 'a8c/donations' );
		registerBlockType( 'a8c/donations', {
			...donationsBlock,
			title: `${ donationsBlock.title } (${ paidFlag })`,
		} );
	}
};

/**
 * Function to register blocks provided by CoBlocks.
 */
function registerDonationsBlock() {
	registerBlockType( 'a8c/donations', {
		title: __( 'Donations', 'donations' ),
		description: __( 'Accept donations on your site.', 'donations' ),
		category: 'common',
		icon: (
			<svg
				width="25"
				height="24"
				viewBox="0 0 25 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12.7439 14.4271L8.64053 13.165L8.51431 13.8718L8.09208 20.7415C8.06165 21.2365 8.61087 21.5526 9.02363 21.2776L12.7439 18.799L16.7475 21.304C17.1687 21.5676 17.7094 21.2343 17.6631 20.7396L17.0212 13.8718L17.0212 13.165L12.7439 14.4271Z"
					fill="black"
				/>
				<circle
					cx="12.7439"
					cy="8.69796"
					r="5.94466"
					stroke="black"
					strokeWidth="1.5"
					fill="none"
				/>
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
		keywords: [
			'donations',
			/* translators: block keyword */
			__( 'premium', 'donations' ),
			/* translators: block keyword */
			__( 'paywall', 'donations' ),
		],
		edit() {
			return <div>Donations block</div>;
		},
		save() {
			return <div>Donations block</div>;
		},
	} );

	// Done after blocks are registered so the status API request doesn't suspend the execution.
	addPaidBlockFlags();
}

registerDonationsBlock();
