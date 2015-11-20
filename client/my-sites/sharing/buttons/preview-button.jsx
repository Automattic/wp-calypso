/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var formatting = require( 'lib/formatting' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'SharingButtonsPreviewButton',

	propsTypes: {
		button: React.PropTypes.object.isRequired,
		style: React.PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		enabled: React.PropTypes.bool,
		onMouseOver: React.PropTypes.func,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			style: 'icon',
			enabled: true,
			onClick: function() {}
		};
	},

	getIcon: function() {
		if ( 'string' === typeof this.props.button.genericon ) {
			return <span className="noticon sharing-buttons-preview-button__glyph" aria-hidden="true">{ formatting.unicodeToString( this.props.button.genericon ) }</span>;
		} else if ( 'string' === typeof this.props.button.icon ) {
			return <span className="sharing-buttons-preview-button__custom-icon" style={ { backgroundImage: 'url(' + this.props.button.icon + ')' } }></span>;
		}
	},

	onClick: function() {
		analytics.ga.recordEvent( 'Sharing', 'Clicked Share Button', this.props.button.ID );
		this.props.onClick();
	},

	render: function() {
		var classes = classNames( 'sharing-buttons-preview-button', 'style-' + this.props.style, 'share-' + this.props.button.ID, {
			'is-enabled': this.props.enabled
		} );

		return (
			<div className={ classes } onClick={ this.onClick } onMouseOver={ this.props.onMouseOver }>
				{ this.getIcon() }<span className="sharing-buttons-preview-button__service">{ this.props.button.name }</span>
			</div>
		);
	}
} );
