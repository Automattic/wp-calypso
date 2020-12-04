/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import Tooltip from 'calypso/components/tooltip';

export default class extends React.PureComponent {
	static displayName = 'Token';

	static propTypes = {
		value: PropTypes.string.isRequired,
		displayTransform: PropTypes.func.isRequired,
		onClickRemove: PropTypes.func,
		status: PropTypes.oneOf( [ 'error', 'success', 'validating' ] ),
		isBorderless: PropTypes.bool,
		tooltip: PropTypes.string,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		onClickRemove: () => {},
		isBorderless: false,
		disabled: false,
	};

	render() {
		const { value, status, isBorderless, tooltip, displayTransform } = this.props;
		const tokenClasses = classNames( 'token-field__token', {
			'is-error': 'error' === status,
			'is-success': 'success' === status,
			'is-validating': 'validating' === status,
			'is-borderless': isBorderless,
			'is-disabled': this.props.disabled,
		} );

		return (
			<span
				className={ tokenClasses }
				tabIndex="-1"
				onMouseEnter={ this.props.onMouseEnter }
				onMouseLeave={ this.props.onMouseLeave }
			>
				<span className="token-field__token-text">{ displayTransform( value ) }</span>
				<Gridicon
					icon="cross-small"
					size={ 24 }
					className="token-field__remove-token"
					onClick={ ! this.props.disabled ? this._onClickRemove : null }
				/>
				{ tooltip && (
					<Tooltip showOnMobile context={ this } status={ status } isVisible position="bottom">
						{ tooltip }
					</Tooltip>
				) }
			</span>
		);
	}

	_onClickRemove = () => {
		this.props.onClickRemove( {
			value: this.props.value,
		} );
	};
}
