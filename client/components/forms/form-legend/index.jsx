/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

module.exports = React.createClass( {

	displayName: 'FormLegend',

	render: function() {
		return (
			<legend { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-legend' ) } >
				{ this.props.children }
			</legend>
		);
	}
} );
