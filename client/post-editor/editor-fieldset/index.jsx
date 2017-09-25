/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass( {
	displayName: 'EditorFieldset',

	propTypes: {
		legend: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.element
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
