/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import photon from 'photon';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

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
		const shortnameToSocialLogo = {
			email: 'mail',
			'google-plus-1': 'google-plus-alt',
			pinterest: 'pinterest-alt',
			tumblr: 'tumblr-alt',
			'jetpack-whatsapp': 'whatsapp',
			'press-this': 'wordpress',
			twitter: 'twitter-alt',
			more: 'share'
		}
		if ( ! this.props.button.custom ) {
			const icon = shortnameToSocialLogo[ this.props.button.ID ] || this.props.button.shortname;

			return <SocialLogo icon={ icon } size={ 18 } />;
		} else if ( 'string' === typeof this.props.button.icon ) {
			return <span className="sharing-buttons-preview-button__custom-icon" style={ { backgroundImage: 'url(' + photon( this.props.button.icon, { width: 16 } ) + ')' } }></span>;
		}
	},

	onClick: function() {
		analytics.ga.recordEvent( 'Sharing', 'Clicked Share Button', this.props.button.ID );
		this.props.onClick();
	},

	render: function() {
		var classes = classNames( 'sharing-buttons-preview-button', 'style-' + this.props.style, 'share-' + this.props.button.ID, {
			'is-enabled': this.props.enabled,
			'is-custom': this.props.button.custom
		} );

		return (
			<div className={ classes } onClick={ this.onClick } onMouseOver={ this.props.onMouseOver }>
				{ this.getIcon() }<span className="sharing-buttons-preview-button__service">{ this.props.button.name }</span>
			</div>
		);
	}
} );
