/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CompactToggle = require( 'components/forms/form-toggle/compact' );

module.exports = React.createClass( {

	displayName: 'PluginAction',

	renderLabel: function( id ) {
		if ( this.props.label ) {
			return ( <label className="plugin-action__label" onClick={ this.props.action } htmlFor={ id }>{ this.props.label }</label> );
		}
		return null;
	},

	renderToggle: function( id ) {
		return (
			<CompactToggle
				onChange={ this.props.action }
				checked={ this.props.status }
				toggling={ this.props.inProgress }
				disabled={ this.props.disabled }
				id={ id }
			>
				{ this.renderLabel( id ) }
			</CompactToggle>
		);
	},

	renderChildren: function( id ) {
		return (
			<div>
				<span className="plugin-action__children">{ this.props.children }</span>
				{ this.renderLabel( id ) }
			</div>
		);
	},

	render: function() {
		var id = this.props.htmlFor;
		return (
			<div className={ classNames( 'plugin-action', this.props.className ) }>
				{ 0 < React.Children.count( this.props.children ) ? this.renderChildren( id ) : this.renderToggle( id ) }
			</div>
		);
	}
} );
