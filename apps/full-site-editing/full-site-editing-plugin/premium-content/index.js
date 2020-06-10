/**
 * External dependencies
 */
import { mergeWith } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import * as container from './blocks/container';
import * as subscriberView from './blocks/subscriber-view';
import * as loggedOutView from './blocks/logged-out-view';
import * as loginButton from './blocks/login-button';

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
 * Updates the settings of the given block.
 *
 * @param name {string} Block name
 * @param settings {object} Block settings
 */
const updateBlockType = ( name, settings ) => {
	const blockType = getBlockType( name );
	if ( ! blockType ) {
		return;
	}
	unregisterBlockType( name );
	const updatedSettings = mergeWith( {}, blockType, settings, ( objValue, srcValue ) => {
		if ( Array.isArray( objValue ) ) {
			return objValue.concat( srcValue );
		}
	} );
	registerBlockType( name, updatedSettings );
};

/**
 * Gets the current status of the Memberships module.
 *
 * @returns {Promise} Memberships status
 */
const getMembershipsStatus = async () => {
	try {
		return apiFetch( { path: '/wpcom/v2/memberships/status' } );
	} catch {
		return null;
	}
};

/**
 * Appends a "paid" tag to the Premium Content block title if site requires an upgrade.
 *
 * @param membershipsStatus {object} Memberships status
 */
const addPaidBlockFlags = ( membershipsStatus ) => {
	if ( ! membershipsStatus.should_upgrade_to_access_memberships ) {
		return;
	}

	const paidFlag = _x(
		'paid',
		'Short label appearing near a block requiring a paid plan',
		'full-site-editing'
	);

	updateBlockType( container.name, { title: `${ container.settings.title } (${ paidFlag })` } );
};

/**
 * Hides the login button block from the inserter if the Memberships module is not set up.
 *
 * @param membershipsStatus {object} Memberships status
 */
const hideLoginButtonIfMembershipsNotSetUp = ( membershipsStatus ) => {
	if (
		! membershipsStatus.should_upgrade_to_access_memberships &&
		membershipsStatus.connected_account_id
	) {
		return;
	}

	updateBlockType( loginButton.name, { supports: { inserter: false } } );
};

/**
 * Sets the buttons block as possible parent of the Recurring Payments block, so it can be inserted in the buttons group
 * displayed in the non-subscriber view of the Premium Content block.
 *
 * @param membershipsStatus {object} Memberships status
 */
const setButtonsParentBlock = ( membershipsStatus ) => {
	if (
		membershipsStatus.should_upgrade_to_access_memberships ||
		! membershipsStatus.connected_account_id
	) {
		return;
	}

	updateBlockType( 'jetpack/recurring-payments', { parent: [ 'core/buttons' ] } );
};

/**
 * Configures the Premium Content blocks.
 */
const configurePremiumContentBlocks = async () => {
	const membershipsStatus = await getMembershipsStatus();
	addPaidBlockFlags( membershipsStatus );
	hideLoginButtonIfMembershipsNotSetUp( membershipsStatus );
	setButtonsParentBlock( membershipsStatus );
};

/**
 * Function to register Premium Content blocks.
 */
export const registerPremiumContentBlocks = () => {
	[ container, loggedOutView, subscriberView, loginButton ].forEach( registerBlock );
};

registerPremiumContentBlocks();
configurePremiumContentBlocks();
