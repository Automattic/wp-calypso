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
				<span><Gridicon size={ 24 } icon={ icon } /> { this.props.text }</span>
			</div>
		);
	}
} );
