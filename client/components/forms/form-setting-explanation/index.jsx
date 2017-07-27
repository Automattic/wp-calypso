/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { omit } from 'lodash';

export default React.createClass( {

	displayName: 'FormSettingExplanation',

	propTypes: {
		noValidate: PropTypes.bool,
		isIndented: PropTypes.bool,
		className: PropTypes.string
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
			<p { ...omit( this.props, 'className', 'noValidate', 'isIndented' ) }
				className={ classes } >
				{ this.props.children }
			</p>
		);
	}
} );
