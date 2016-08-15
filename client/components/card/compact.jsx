/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { assign } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

module.exports = React.createClass( {
	displayName: 'CompactCard',

	render: function() {
		const props = assign( {}, this.props, { className: classnames( this.props.className, 'is-compact' ) } );

		return (
			<Card { ...props }>
				{ this.props.children }
			</Card>
		);
	}
} );
