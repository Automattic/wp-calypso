/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin'
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip'

export default React.createClass( {

	displayName: 'Token',

	propTypes: {
		value: PropTypes.string.isRequired,
		displayTransform: PropTypes.func.isRequired,
		onClickRemove: PropTypes.func,
		status: PropTypes.oneOf( [ 'error', 'success', 'validating' ] ),
		isBorderless: PropTypes.bool,
		tooltip: PropTypes.string,
		disabled: PropTypes.bool
	},

	getDefaultProps() {
		return {
			onClickRemove: () => {},
			isBorderless: false,
			disabled: false
		};
	},

	mixins: [ PureRenderMixin ],

	render() {
		const { value, status, isBorderless, tooltip, displayTransform } = this.props;
		const tokenClasses = classNames( 'token-field__token', {
			'is-error': 'error' === status,
			'is-success': 'success' === status,
			'is-validating': 'validating' === status,
			'is-borderless': isBorderless,
			'is-disabled': this.props.disabled
		} );

		return (
			<span
				className={ tokenClasses }
				tabIndex="-1"
				onMouseEnter={ this.props.onMouseEnter }
				onMouseLeave={ this.props.onMouseLeave } >
				<span className="token-field__token-text">
					{ displayTransform( value ) }
				</span>
				<span
					className="token-field__remove-token noticon noticon-close-alt"
					onClick={ ! this.props.disabled && this._onClickRemove } />
				{ tooltip &&
					<Tooltip showOnMobile context={ this } status={ status } isVisible={ true } position="bottom">
						{ tooltip }
					</Tooltip>
				}
			</span>
		);
	},

	_onClickRemove() {
		this.props.onClickRemove( {
			value: this.props.value
		} );
	}
} );
