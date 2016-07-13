/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { omit } from 'lodash';

export default React.createClass( {

	displayName: 'FormSettingExplanation',

	propTypes: {
		noValidate: React.PropTypes.bool,
		isIndented: React.PropTypes.bool,
		className: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			noValidate: false,
			isIndented: false,
		};
	},

	render() {
		const classes = classNames( this.props.className, 'form-setting-explanation', {
			'no-validate': this.props.noValidate,
			'is-indented': this.props.isIndented
		} );

		return (
			<p { ...omit( this.props, 'className' ) }
				className={ classes } >
				{ this.props.children }
			</p>
		);
	}
} );
