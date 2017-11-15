/** @format */

/**
 * External dependencies
 */

import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export class RemoveButton extends React.Component {
	static propTypes = {
		onRemove: PropTypes.func.isRequired,

		// Inherited
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { onRemove, translate } = this.props;

		return (
			<Button onClick={ onRemove } compact className="remove-button">
				<span className="remove-button__label screen-reader-text">{ translate( 'Remove' ) }</span>

				<Gridicon icon="cross" size={ 24 } className="remove-button__icon" />
			</Button>
		);
	}
}

export default localize( RemoveButton );
