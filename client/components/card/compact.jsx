/**
 * External dependencies
 */
import classnames from 'classnames';
import createClass from 'create-react-class';
import { assign } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default createClass( {
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
