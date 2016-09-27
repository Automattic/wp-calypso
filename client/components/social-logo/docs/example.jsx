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
			<div>
				<SocialLogo icon="amazon" size={ 48 } onClick={ this.handleClick.bind( this, 'amazon' ) } />
				<SocialLogo icon="behance" size={ 48 } onClick={ this.handleClick.bind( this, 'behance' ) } />
				<SocialLogo icon="blogger-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'blogger-alt' ) } />
				<SocialLogo icon="blogger" size={ 48 } onClick={ this.handleClick.bind( this, 'blogger' ) } />
				<SocialLogo icon="codepen" size={ 48 } onClick={ this.handleClick.bind( this, 'codepen' ) } />
				<SocialLogo icon="dribbble" size={ 48 } onClick={ this.handleClick.bind( this, 'dribbble' ) } />
				<SocialLogo icon="dropbox" size={ 48 } onClick={ this.handleClick.bind( this, 'dropbox' ) } />
				<SocialLogo icon="eventbrite" size={ 48 } onClick={ this.handleClick.bind( this, 'eventbrite' ) } />
				<SocialLogo icon="facebook" size={ 48 } onClick={ this.handleClick.bind( this, 'facebook' ) } />
				<SocialLogo icon="feed" size={ 48 } onClick={ this.handleClick.bind( this, 'feed' ) } />
				<SocialLogo icon="flickr" size={ 48 } onClick={ this.handleClick.bind( this, 'flickr' ) } />
				<SocialLogo icon="foursquare" size={ 48 } onClick={ this.handleClick.bind( this, 'foursquare' ) } />
				<SocialLogo icon="ghost" size={ 48 } onClick={ this.handleClick.bind( this, 'ghost' ) } />
				<SocialLogo icon="github" size={ 48 } onClick={ this.handleClick.bind( this, 'github' ) } />
				<SocialLogo icon="google-plus-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'google-plus-alt' ) } />
				<SocialLogo icon="google-plus" size={ 48 } onClick={ this.handleClick.bind( this, 'google-plus' ) } />
				<SocialLogo icon="instagram" size={ 48 } onClick={ this.handleClick.bind( this, 'instagram' ) } />
				<SocialLogo icon="linkedin" size={ 48 } onClick={ this.handleClick.bind( this, 'linkedin' ) } />
				<SocialLogo icon="mail" size={ 48 } onClick={ this.handleClick.bind( this, 'mail' ) } />
				<SocialLogo icon="medium" size={ 48 } onClick={ this.handleClick.bind( this, 'medium' ) } />
				<SocialLogo icon="path-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'path-alt' ) } />
				<SocialLogo icon="path" size={ 48 } onClick={ this.handleClick.bind( this, 'path' ) } />
				<SocialLogo icon="pinterest-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'pinterest-alt' ) } />
				<SocialLogo icon="pinterest" size={ 48 } onClick={ this.handleClick.bind( this, 'pinterest' ) } />
				<SocialLogo icon="pocket" size={ 48 } onClick={ this.handleClick.bind( this, 'pocket' ) } />
				<SocialLogo icon="polldaddy" size={ 48 } onClick={ this.handleClick.bind( this, 'polldaddy' ) } />
				<SocialLogo icon="print" size={ 48 } onClick={ this.handleClick.bind( this, 'print' ) } />
				<SocialLogo icon="reddit" size={ 48 } onClick={ this.handleClick.bind( this, 'reddit' ) } />
				<SocialLogo icon="share" size={ 48 } onClick={ this.handleClick.bind( this, 'share' ) } />
				<SocialLogo icon="skype" size={ 48 } onClick={ this.handleClick.bind( this, 'skype' ) } />
				<SocialLogo icon="spotify" size={ 48 } onClick={ this.handleClick.bind( this, 'spotify' ) } />
				<SocialLogo icon="squarespace" size={ 48 } onClick={ this.handleClick.bind( this, 'squarespace' ) } />
				<SocialLogo icon="stumbleupon" size={ 48 } onClick={ this.handleClick.bind( this, 'stumbleupon' ) } />
				<SocialLogo icon="telegram" size={ 48 } onClick={ this.handleClick.bind( this, 'telegram' ) } />
				<SocialLogo icon="tumblr-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'tumblr-alt' ) } />
				<SocialLogo icon="tumblr" size={ 48 } onClick={ this.handleClick.bind( this, 'tumblr' ) } />
				<SocialLogo icon="twitch" size={ 48 } onClick={ this.handleClick.bind( this, 'twitch' ) } />
				<SocialLogo icon="twitter-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'twitter-alt' ) } />
				<SocialLogo icon="twitter" size={ 48 } onClick={ this.handleClick.bind( this, 'twitter' ) } />
				<SocialLogo icon="vimeo" size={ 48 } onClick={ this.handleClick.bind( this, 'vimeo' ) } />
				<SocialLogo icon="whatsapp" size={ 48 } onClick={ this.handleClick.bind( this, 'whatsapp' ) } />
				<SocialLogo icon="wordpress" size={ 48 } onClick={ this.handleClick.bind( this, 'wordpress' ) } />
				<SocialLogo icon="xanga" size={ 48 } onClick={ this.handleClick.bind( this, 'xanga' ) } />
				<SocialLogo icon="youtube" size={ 48 } onClick={ this.handleClick.bind( this, 'youtube' ) } />
			</div>
		);
	}
} );
