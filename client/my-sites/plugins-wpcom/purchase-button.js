/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import Gridicon from 'gridicons';

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
