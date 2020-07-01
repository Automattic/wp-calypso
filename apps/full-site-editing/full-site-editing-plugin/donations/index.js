/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import * as donations from './blocks/donations';
import * as donation from './blocks/donation';

/**
 * Style dependencies
 */
import './style.scss';

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
		const donationsBlock = getBlockType( donations.name );
		if ( ! donationsBlock ) {
			return;
		}

		const paidFlag = _x(
			'paid',
			'Short label appearing near a block requiring a paid plan',
			'full-site-editing'
		);

		unregisterBlockType( donations.name );
		registerBlockType( donations.name, {
			...donationsBlock,
			title: `${ donationsBlock.title } (${ paidFlag })`,
		} );
	}
};

function registerDonationsBlock() {
	[ donations, donation ].forEach( ( { name, settings } ) => {
		registerBlockType( name, settings );
	} );

	// Done after registration so the status API request doesn't suspend the execution.
	addPaidBlockFlags();
}

registerDonationsBlock();
