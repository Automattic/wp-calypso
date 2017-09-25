/**
 * External dependencies
 */
import React from 'react';

import classNames from 'classnames';

module.exports = React.createClass( {
	displayName: 'EditorFieldset',

	propTypes: {
		legend: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element
		] ).isRequired
	},

	renderChildren: function() {
		return React.Children.map( this.props.children, function( child ) {
			return <div className="editor-fieldset__option">{ child }</div>;
		} );
	},

	render: function() {
		return (
			<fieldset className={ classNames( 'editor-fieldset', this.props.className ) }>
				<legend className="editor-fieldset__legend">{ this.props.legend }</legend>
				{ this.renderChildren() }
			</fieldset>
		);
	}
} );
