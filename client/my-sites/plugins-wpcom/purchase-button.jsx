/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export const PurchaseButton = ( {
	href,
	isActive,
	translate = identity,
} ) => isActive
	? (
		<Button className="is-active-plugin" compact borderless>
			<Gridicon icon="checkmark" />{ translate( 'Active' ) }
		</Button>
	)
	: (
		<Button compact primary { ...{ href } }>
			{ translate( 'Upgrade' ) }
		</Button>
	);

PurchaseButton.propTypes = {
	href: PropTypes.string.isRequired,
	isActive: PropTypes.bool.isRequired,
};

export default localize( PurchaseButton );
