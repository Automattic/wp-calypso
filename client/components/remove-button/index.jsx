/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export class RemoveButton extends React.Component {
	static propTypes = {
		onRemove: PropTypes.func.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	render() {
		const { onRemove, translate } = this.props;

		return (
			<Button
				onClick={ onRemove }
				compact
				className="remove-button"
			>
				<span className="remove-button__label screen-reader-text">
					{ translate( 'Remove' ) }
				</span>

				<Gridicon
					icon="cross"
					size={ 24 }
					className="remove-button__icon"
				/>
			</Button>
		);
	}
}

export default localize( RemoveButton );
