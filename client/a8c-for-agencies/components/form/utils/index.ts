import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:a4a:form-utils' );

export const NON_UNIQUE_DOMAIN_DENYLIST = new Set( [
	// Free email providers
	'163.com',
	'aol.com',
	'daum.net',
	'duck.com',
	'fastmail.com',
	'gmail.com',
	'gmx.com',
	'gmx.de',
	'googlemail.com',
	'hanmail.net',
	'hey.com',
	'hotmail.co.uk',
	'hotmail.com',
	'hotmail.de',
	'hotmail.fr',
	'icloud.com',
	'inbox.com',
	'live.com',
	'mac.com',
	'mail.com',
	'mail.ru',
	'me.com',
	'msn.com',
	'naver.com',
	'outlook.co.uk',
	'outlook.com',
	'outlook.de',
	'outlook.es',
	'outlook.fr',
	'outlook.it',
	'pm.me',
	'proton.me',
	'protonmail.com',
	'qq.com',
	'rambler.ru',
	'rediffmail.com',
	'tutanota.com',
	'web.de',
	'yahoo.ca',
	'yahoo.co.jp',
	'yahoo.co.uk',
	'yahoo.com',
	'yahoo.com.au',
	'yahoo.de',
	'yahoo.fr',
	'yandex.com',
	'zoho.com',
	'google.com',
	'bing.com',
	// US ISPs
	'astound.net',
	'att.net',
	'bell.net',
	'bellsouth.net',
	'cablevision.com',
	'centurylink.net',
	'charter.net',
	'cogeco.ca',
	'comcast.net',
	'cox.net',
	'earthlink.net',
	'frontier.com',
	'mediacom.com',
	'optimum.net',
	'rcn.com',
	'rogers.com',
	'sasktel.net',
	'sbcglobal.net',
	'shaw.ca',
	'suddenlink.net',
	'sympatico.ca',
	'telus.net',
	'verizon.net',
	'videotron.ca',
	'windstream.net',
	'wowway.com',
	// AU/SG ISPs
	'bigpond.com',
	'iinet.net.au',
	'internode.on.net',
	'optusnet.com.au',
	'pacific.net.sg',
	'singnet.com.sg',
	'tpg.com.au',
	// EU ISPs
	'alice.it',
	'bluewin.ch',
	'brinternet.co',
	'btinternet.com',
	'ee.co.uk',
	'eircom.net',
	'free.fr',
	'libero.it',
	'ntlworld.com',
	'o2.co.uk',
	'o2.pl',
	'orange.fr',
	'plusnet.com',
	'sfr.fr',
	'sky.com',
	't-online.de',
	'talktalk.net',
	'three.co.uk',
	'tiscali.co.uk',
	'tiscali.it',
	'upc.nl',
	'virgin.net',
	'virginmedia.com',
	'vodafone.com',
	'vodafone.de',
	'wanadoo.fr',
	'wp.pl',
	'xs4all.nl',
	'ziggo.nl',
	// Social platforms
	'facebook.com',
	'instagram.com',
	'linkedin.com',
	'mastodon.social',
	'pinterest.com',
	'reddit.com',
	'snapchat.com',
	'threads.net',
	'tiktok.com',
	'twitter.com',
	'x.com',
	'wa.me',
	'whatsapp.com',
	// Hosting/site builders
	'azurewebsites.net',
	'blogger.com',
	'blogspot.com',
	'cargo.site',
	'carrd.co',
	'firebaseapp.com',
	'fly.dev',
	'format.com',
	'ghost.io',
	'github.io',
	'godaddy.com',
	'herokuapp.com',
	'jimdo.com',
	'medium.com',
	'myshopify.com',
	'netlify.app',
	'notion.site',
	'notion.so',
	'pages.dev',
	'shopify.com',
	'sites.google.com',
	'squarespace.com',
	'strikingly.com',
	'substack.com',
	'tumblr.com',
	'vercel.app',
	'webflow.io',
	'webnode.com',
	'weebly.com',
	'wix.com',
	'wixsite.com',
	'wordpress.com',
	// Link shorteners / bio link tools
	'beacons.ai',
	'bio.link',
	'bit.ly',
	'buff.ly',
	'campsite.bio',
	'goo.gl',
	'hoo.be',
	'linktr.ee',
	'lnk.to',
	'maps.app',
	'ow.ly',
	'rebrand.ly',
	'shorby.com',
	'solo.to',
	'stan.store',
	't.co',
	'tap.bio',
	'tinyurl.com',
	// Freelance/marketplace platforms
	'99designs.com',
	'behance.net',
	'clutch.co',
	'dribbble.com',
	'fiverr.com',
	'freelancer.com',
	'sortlist.com',
	'toptal.com',
	'upwork.com',
	'lovable.dev',
	// Google products
	'calendar.google.com',
	'docs.google.com',
	'drive.google.com',
	'forms.google.com',
	'meet.google.com',
	'share.google',
	'youtube.com',
	'maps.app.goo.gl',
	// Placeholder/test/throwaway domains
	'blank.com',
	'example.com',
	'grr.la',
	'guerrillamail.com',
	'mailinator.com',
	'na.com',
	'no.com',
	'noemail.com',
	'none.com',
	'noreply.com',
	'placeholder.com',
	'sharklasers.com',
	'temp.com',
	'tempmail.com',
	'test.com',
	'testing.com',
	'throwaway.email',
	'www.example.com',
	// Automattic-owned
	'automattic.com',
	'gravatar.com',
	'pressable.com',
	'wpvip.com',
] );

export function extractRootDomain( url: string ): string {
	let cleaned = url.trim().toLowerCase();
	cleaned = cleaned.replace( /^https?:\/\//, '' );
	cleaned = cleaned.replace( /^www\./, '' );
	cleaned = cleaned.split( '/' )[ 0 ];
	cleaned = cleaned.split( '?' )[ 0 ];
	cleaned = cleaned.split( '#' )[ 0 ];
	cleaned = cleaned.split( ':' )[ 0 ];
	return cleaned;
}

export function isDeniedNonUniqueDomain( url: string ): boolean {
	const domain = extractRootDomain( url );
	if ( NON_UNIQUE_DOMAIN_DENYLIST.has( domain ) ) {
		return true;
	}
	const parts = domain.split( '.' );
	if ( parts.length > 2 ) {
		const parentDomain = parts.slice( -2 ).join( '.' );
		if ( NON_UNIQUE_DOMAIN_DENYLIST.has( parentDomain ) ) {
			return true;
		}
	}
	return false;
}

export function isValidUrl( url: string ) {
	return (
		url.length > 3 &&
		/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url )
	);
}

export function areURLsUnique( urls: unknown[] ) {
	const urlSet = new Set( urls );
	return urlSet.size === urls.length;
}

export async function isSiteActive( url: string ) {
	// Ensure the URL has a valid protocol (default to HTTPS if missing)
	if ( ! /^https?:\/\//i.test( url ) ) {
		url = `https://${ url }`;
	}

	try {
		// Make a request to the wpcom API to validate the URL
		const response = await wpcom.req.get( {
			path: `/agency/validate/url?value=${ encodeURIComponent( url ) }`,
			apiNamespace: 'wpcom/v2',
		} );

		if ( response?.is_valid ) {
			return true;
		}

		return false;
	} catch ( error ) {
		debug( `Error checking site: ${ error }` );
		return false;
	}
}

export async function isAgencyNameExists( agencyName: string ) {
	const response = await wpcom.req.get( {
		path: `/agency/exists/name?value=${ encodeURIComponent( agencyName ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	if ( response?.exists ) {
		return true;
	}

	return false;
}

export async function isAgencyUrlExists( url: string ) {
	const response = await wpcom.req.get( {
		path: `/agency/exists/url?value=${ encodeURIComponent( url ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	if ( response?.exists ) {
		return true;
	}

	return false;
}
