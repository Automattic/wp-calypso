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

	handleAction: function( event ) {
		if ( ! this.props.disabledInfo ) {
			this.props.action();
		} else {
			this.refs.infoPopover._onClick( event );
		}
	},

	renderLabel: function() {
		if ( this.props.label ) {
			return (
				<label
					className="plugin-action__label"
					ref="disabledInfoLabel"
					onClick={ this.handleAction }
					htmlFor={ this.props.htmlFor }
					key="renderDisabledInfoLabel"
					>
					{ this.props.label }
				</label>
			);
		}
		return null;
	},

	renderDisabledInfo: function() {
		return [ <InfoPopover
					key="renderDisabledInfoPopOver"
					className="plugin-action__disabled-info"
					position="bottom left"
					popoverName={ 'Plugin Action Disabled' + this.props.label }
					gaEventCategory="Plugins"
					ref="infoPopover"
					ignoreContext={ this.refs && this.refs.disabledInfoLabel }
					>
					{ this.props.disabledInfo }
				</InfoPopover>, this.renderLabel() ];
	},

	renderToggle: function() {
		return (
			<CompactToggle
				onChange={ this.props.action }
				checked={ this.props.status }
				toggling={ this.props.inProgress }
				disabled={ this.props.disabled }
				id={ this.props.htmlFor }
			>
				{ this.renderLabel() }
			</CompactToggle>
		);
	},

	renderChildren: function() {
		return (
			<div>
				<span className="plugin-action__children">{ this.props.children }</span>
				{ this.renderLabel() }
			</div>
		);
	},

	renderInner: function() {
		if ( this.props.disabledInfo ) {
			return this.renderDisabledInfo();
		}

		if ( 0 < React.Children.count( this.props.children ) ) {
			return this.renderChildren();
		}

		return this.renderToggle();
	},

	render: function() {
		return (
			<div className={ classNames( 'plugin-action', { 'is-disabled': this.props.disabled }, this.props.className ) }>
				{ this.renderInner() }
			</div>
		);
	}
} );
