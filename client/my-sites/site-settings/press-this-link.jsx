/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import paths from 'lib/paths';

/**
 * Retrieves selection, title, and URL from current page and pops
 * open new editor window with contents
 * @param  {string} postURL Editor URL for selected site
 */
const pressThis = function( postURL ) {
	const doc = document;
	const win = window;
	const winGetSel = win.getSelection;
	const docGetSel = doc.getSelection;
	const docSel = doc.selection;
	const loc = doc.location;
	let sel;

	if ( winGetSel ) {
		sel = winGetSel()
	} else if ( docGetSel ) {
		sel = docGetSel()
	} else {
		sel = docSel ? docSel.createRange().text : 0
	}

	let url = postURL + '?url=' + encodeURIComponent( loc.href ) + '&title=' + encodeURIComponent( doc.title ) + '&text=' + encodeURIComponent( sel ) + '&v=5';

	let redirect = function() {
		if ( ! win.open( url, 't', 'toolbar=0,resizable=1,scrollbars=1,status=1,width=660,height=570' ) ) {
			loc.href = url;
		}
	};

	if ( /Firefox/.test( navigator.userAgent ) ) {
		setTimeout( redirect, 0 );
	} else {
		redirect();
	}
	void( 0 );
};

class PressThisLink extends React.Component {

	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	/**
	 * Legacy press-this pointing to wp-admin. This will be
	 * deprecated and removed soon.
	 * @return {string} javascript pseudo-protocol link
	 */
	pressThisWPAdmin() {
		let site = this.props.site;
		let adminURL = site && site.options && site.options.admin_url;
		return [
			"javascript:var d=document,w=window,e=w.getSelection,k=d.getSelection,x=d.selection,s=(e?e():(k)?k():(x?x.createRange().text:0)),f='", // eslint-disable-line no-script-url
			adminURL,
			"press-this.php',l=d.location,e=encodeURIComponent,u=f+'?u='+e(l.href)+'&t='+e(d.title)+'&s='+e(s)+'&v=4';a=function(){",
			"if(!w.open(u,'t','toolbar=0,resizable=1,scrollbars=1,status=1,width=720,height=570'))l.href=u;};if (/Firefox/.test(navigator.userAgent)) setTimeout(a, 0); else a();void(0)"
		].join( '' );
	}

	/**
	 * generate press-this link pointing to current environment
	 * @return {string} javascript pseudo-protocol link
	 */
	buildPressThisLink() {
		const functionText = pressThis.toString();
		// IE does not reliably support window.location.origin
		let postDomain = ( typeof window !== 'undefined' && window.location ) ? `${window.location.protocol}//${window.location.hostname}` : 'https://wordpress.com';
		if ( window.location.port ) {
			postDomain += `:${ window.location.port }`;
		}
		const postURL = postDomain + paths.newPost( this.props.site );
		return `javascript:( ${functionText} )( '${postURL}' )`;
	}

	render() {
		return (
			<a {...this.props} href={ this.buildPressThisLink() }>
				{ this.props.children }
			</a>
		);
	}
};

export default PressThisLink;
