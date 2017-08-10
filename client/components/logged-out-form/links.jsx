/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default React.createClass( {
	displayName: 'LoggedOutFormLinks',

	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string,
	},

	render() {
		return (
			<div
				{ ...omit( this.props, 'classNames' ) }
				className={ classnames( 'logged-out-form__links', this.props.className ) }
			>
				{ this.props.children }
			</div>
		);
	},
} );
