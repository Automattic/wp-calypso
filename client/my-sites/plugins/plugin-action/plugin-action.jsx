/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CompactToggle = require( 'components/forms/form-toggle/compact' ),
	InfoPopover = require( 'components/info-popover' );

module.exports = React.createClass( {

	displayName: 'PluginAction',

	getInitialState() {
		return {
			showPopover: false,
			previousClickOutside: false
		};
	},

	handleAction: function() {
		if ( ! this.props.disabledInfo ) {
			this.props.action();
		} else {
			this.togglePopover( ! this.state.showPopover );
		}
	},

	togglePopover: function( state ) {
		this.setState( { showPopover: state } );
	},

	renderLabel: function( id ) {
		if ( this.props.label ) {
			return ( <label className="plugin-action__label" onClick={ this.handleAction } htmlFor={ id }>{ this.props.label }</label> );
		}
		return null;
	},

	renderToggle: function( id ) {
		if ( this.props.disabledInfo ) {
			return (
				<div className="plugin-action__disabled-info">
					<InfoPopover position="bottom left" ref="infoPopover" isVisible={ this.state.showPopover } toggle={ this.togglePopover } >
						{ this.props.disabledInfo }
					</InfoPopover>
					{ this.renderLabel( id ) }
				</div>
			);
		}
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
