import SocialLogo from '../index';

const logos = [
	'amazon',
	'behance',
	'blogger',
	'blogger-alt',
	'bluesky',
	'codepen',
	'dribbble',
	'dropbox',
	'eventbrite',
	'facebook',
	'feed',
	'fediverse',
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
	'mastodon',
	'medium',
	'nextdoor',
	'pinterest',
	'pinterest-alt',
	'pocket',
	'polldaddy',
	'print',
	'reddit',
	'share',
	'skype',
	'sms',
	'spotify',
	'squarespace',
	'stumbleupon',
	'telegram',
	'threads',
	'tumblr',
	'tumblr-alt',
	'twitch',
	'twitter',
	'twitter-alt',
	'vimeo',
	'whatsapp',
	'woocommerce',
	'wordpress',
	'x',
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
