/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SocialLogo from '../index';

const logos = [
	'amazon',
	'behance',
	'blogger',
	'blogger-alt',
	'codepen',
	'dribbble',
	'dropbox',
	'eventbrite',
	'facebook',
	'feed',
	'flickr',
	'foursquare',
	'ghost',
	'github',
	'google',
	'google-alt',
	'google-plus',
	'google-plus-alt',
	'instagram',
	'linkedin',
	'mail',
	'medium',
	'pinterest',
	'pinterest-alt',
	'pocket',
	'polldaddy',
	'print',
	'reddit',
	'share',
	'skype',
	'spotify',
	'squarespace',
	'stumbleupon',
	'telegram',
	'tumblr',
	'tumblr-alt',
	'twitch',
	'twitter',
	'twitter-alt',
	'vimeo',
	'whatsapp',
	'woocommerce',
	'wordpress',
	'xanga',
	'youtube',
];

export default function SocialLogoExample() {
	function handleClick( icon ) {
		const toCopy = '<SocialLogo icon="' + icon + '" />';
		window.prompt( 'Copy component code:', toCopy );
	}

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="design-assets__group">
			<h2>
				<a href="/devdocs/design/social-logo">Social Logo</a>
			</h2>
			<div>
				{ logos.map( ( logo ) => (
					<SocialLogo
						key={ logo }
						icon={ logo }
						size={ 48 }
						onClick={ () => handleClick( logo ) }
					/>
				) ) }
			</div>
		</div>
	);
}

SocialLogoExample.displayName = 'SocialLogo';
