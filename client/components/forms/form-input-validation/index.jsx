/**
 * External dependencies
 */
import React from 'react/addons';
import classNames from 'classnames';

/**
 * Interal dependencies
 */
import Gridicon from 'components/gridicon';

module.exports = React.createClass( {

	displayName: 'FormInputValidation',

	propTypes: {
		isError: React.PropTypes.bool,
		text: React.PropTypes.string,
		icon: React.PropTypes.string
	},

	getDefaultProps() {
		return { isError: false };
	},

	render() {
		const classes = classNames( {
			'form-input-validation': true,
			'is-error': this.props.isError
		} );

		const icon = this.props.isError ? 'notice-outline' : 'checkmark';

		return (
			<div className={ classes }>
				<span><Gridicon size={ 24 } icon={ this.props.icon ? this.props.icon : icon } /> { this.props.text }</span>
			</div>
		);
	}
} );
