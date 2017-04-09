/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

export default React.createClass( {

	displayName: 'FormInputValidation',

	propTypes: {
		isError: React.PropTypes.bool,
		isWarning: React.PropTypes.bool,
		text: React.PropTypes.string,
		icon: React.PropTypes.string
	},

	getDefaultProps() {
		return { isError: false };
	},

	render() {
		const classes = classNames( {
			'form-input-validation': true,
			'is-warning': this.props.isWarning,
			'is-error': this.props.isError
		} );

		const icon = this.props.isError || this.props.isWarning ? 'notice-outline' : 'checkmark';

		return (
			<div className={ classes }>
				<span><Gridicon size={ 24 } icon={ this.props.icon ? this.props.icon : icon } /> { this.props.text }</span>
			</div>
		);
	}
} );
