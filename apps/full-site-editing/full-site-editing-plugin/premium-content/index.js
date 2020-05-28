/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';
/* eslint-enable wpcalypso/import-docblock */

/**
 * Internal dependencies
 */
import * as container from './blocks/container';
import * as subscriberView from './blocks/subscriber-view';
import * as loggedOutView from './blocks/logged-out-view';

/**
 * Function to register an individual block.
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration} BlockConfiguration
 *
 * @typedef {object} Block
 * @property {string} name
 * @property {string} category
 * @property {BlockConfiguration} settings
 *
 * @param {Block} block The block to be registered.
 */
const registerBlock = ( block ) => {
	if ( ! block ) {
		return;
	}

	const { name, category, settings } = block;

	registerBlockType( name, {
		category,
		...settings,
	} );
};

/**
 * Appends a "paid" tag to the Premium Content block title if site requires an upgrade.
 */
const addPaidBlockFlags = async () => {
	const membershipsStatus = await apiFetch( { path: '/wpcom/v2/memberships/status' } );
	const shouldUpgrade = membershipsStatus.should_upgrade_to_access_memberships;
	if ( shouldUpgrade ) {
		const premiumContentBlock = getBlockType( container.name );
		if ( ! premiumContentBlock ) {
			return;
		}

		const paidFlag = _x(
			'paid',
			'Short label appearing near a block requiring a paid plan',
			'premium-content'
		);

		unregisterBlockType( container.name );
		registerBlockType( container.name, {
			...premiumContentBlock,
			title: `${ premiumContentBlock.title } (${ paidFlag })`,
		} );
	}
};

/**
 * Function to register blocks provided by CoBlocks.
 */
export const registerPremiumContentBlocks = () => {
	[ container, loggedOutView, subscriberView ].forEach( registerBlock );

	// Done after blocks are registered so the status API request doesn't suspend the execution.
	addPaidBlockFlags();
};

registerPremiumContentBlocks();
