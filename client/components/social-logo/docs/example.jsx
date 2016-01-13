/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SocialLogo from 'components/social-logo';

export default React.createClass( {
	displayName: 'SocialLogos',

	handleClick( icon ) {
		const toCopy = '<SocialLogo icon="' + icon + '" />';
		window.prompt( 'Copy component code:', toCopy );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2><a href="/devdocs/design/social-logos">Social Logo</a></h2>
				<SocialLogo icon="logo-amazon" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-amazon' ) } />
				<SocialLogo icon="logo-blogger-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-blogger-alt' ) } />
				<SocialLogo icon="logo-blogger" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-blogger' ) } />
				<SocialLogo icon="logo-codepen" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-codepen' ) } />
				<SocialLogo icon="logo-digg" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-digg' ) } />
				<SocialLogo icon="logo-dribbble" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-dribbble' ) } />
				<SocialLogo icon="logo-dropbox" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-dropbox' ) } />
				<SocialLogo icon="logo-eventbrite" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-eventbrite' ) } />
				<SocialLogo icon="logo-facebook" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-facebook' ) } />
				<SocialLogo icon="logo-feed" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-feed' ) } />
				<SocialLogo icon="logo-flickr" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-flickr' ) } />
				<SocialLogo icon="logo-foursquare" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-foursquare' ) } />
				<SocialLogo icon="logo-github" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-github' ) } />
				<SocialLogo icon="logo-google-plus-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-google-plus-alt' ) } />
				<SocialLogo icon="logo-google-plus" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-google-plus' ) } />
				<SocialLogo icon="logo-instagram" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-instagram' ) } />
				<SocialLogo icon="logo-linkedin" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-linkedin' ) } />
				<SocialLogo icon="logo-mail" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-mail' ) } />
				<SocialLogo icon="logo-path-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-path-alt' ) } />
				<SocialLogo icon="logo-path" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-path' ) } />
				<SocialLogo icon="logo-pinterest-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-pinterest-alt' ) } />
				<SocialLogo icon="logo-pinterest" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-pinterest' ) } />
				<SocialLogo icon="logo-pocket" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-pocket' ) } />
				<SocialLogo icon="logo-polldaddy" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-polldaddy' ) } />
				<SocialLogo icon="logo-print" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-print' ) } />
				<SocialLogo icon="logo-reddit" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-reddit' ) } />
				<SocialLogo icon="logo-skype" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-skype' ) } />
				<SocialLogo icon="logo-spotify" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-spotify' ) } />
				<SocialLogo icon="logo-squarespace" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-squarespace' ) } />
				<SocialLogo icon="logo-stumbleupon" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-stumbleupon' ) } />
				<SocialLogo icon="logo-telegram" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-telegram' ) } />
				<SocialLogo icon="logo-tumblr-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-tumblr-alt' ) } />
				<SocialLogo icon="logo-tumblr" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-tumblr' ) } />
				<SocialLogo icon="logo-twitch" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-twitch' ) } />
				<SocialLogo icon="logo-twitter" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-twitter' ) } />
				<SocialLogo icon="logo-vimeo" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-vimeo' ) } />
				<SocialLogo icon="logo-whatsapp" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-whatsapp' ) } />
				<SocialLogo icon="logo-wordpress" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-wordpress' ) } />
				<SocialLogo icon="logo-xanga" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-xanga' ) } />
				<SocialLogo icon="logo-youtube" size={ 48 } onClick={ this.handleClick.bind( this, 'logo-youtube' ) } />
			</div>
		);
	}
} );
