/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default React.createClass( {
	displayName: 'LoggedOutForm',

	propTypes: {
		children: PropTypes.node.isRequired,
		className: PropTypes.string
	},

	render() {
		return (
			<Card className={ classnames( 'logged-out-form', this.props.className ) } >
				<form { ...omit( this.props, 'className' ) }>
					{ this.props.children }
				</form>
			</Card>
		);
	}
} );
