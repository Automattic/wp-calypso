/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { _x } from '@wordpress/i18n';
/* eslint-enable wpcalypso/import-docblock */

/**
 * Internal dependencies
 */
import * as container from './blocks/container';
import * as subscriberView from './blocks/subscriber-view';
import * as loggedOutView from './blocks/logged-out-view';
import * as buttons from './blocks/buttons';
import * as button from './blocks/button';

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
	let membershipsStatus;
	try {
		membershipsStatus = await apiFetch( { path: '/wpcom/v2/memberships/status' } );
	} catch {
		// Do not add any flag if request fails.
		return;
	}
	const shouldUpgrade = membershipsStatus.should_upgrade_to_access_memberships;
	if ( shouldUpgrade ) {
		const premiumContentBlock = getBlockType( container.name );
		if ( ! premiumContentBlock ) {
			return;
		}

		const paidFlag = _x(
			'paid',
			'Short label appearing near a block requiring a paid plan',
			'full-site-editing'
		);

		unregisterBlockType( container.name );
		registerBlockType( container.name, {
			...premiumContentBlock,
			title: `${ premiumContentBlock.title } (${ paidFlag })`,
		} );
	}
};

/**
 * Sets the `premium-content/buttons` block as possible parent of `core/button`, so users can insert regular buttons
 * the Premium Content buttons group.
 */
const setButtonsParentBlock = () => {
	addFilter(
		'blocks.registerBlockType',
		'premium-content/set-buttons-parent-block',
		( settings, name ) => {
			if ( 'core/button' !== name ) {
				return settings;
			}

			return {
				...settings,
				parent: [ ...settings.parent, 'premium-content/buttons' ],
			};
		}
	);
};

/**
 * Function to register blocks provided by CoBlocks.
 */
export const registerPremiumContentBlocks = () => {
	[ container, loggedOutView, subscriberView, buttons, button ].forEach( registerBlock );

	// Done after blocks are registered so the status API request doesn't suspend the execution.
	addPaidBlockFlags();

	setButtonsParentBlock();
};

registerPremiumContentBlocks();
