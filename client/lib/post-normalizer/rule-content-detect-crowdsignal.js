import { forEach } from 'lodash';
import { domForHtml } from './utils';

export default function detectCrowdsignal( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const crowdsignal = dom.querySelectorAll( '.embed-crowdsignal' );
	if ( ! crowdsignal ) {
		return post;
	}
	forEach( crowdsignal, ( crowdsignalElement ) => {
		const authoritativeURL = crowdsignalElement.firstElementChild.getAttribute( 'src' );
		if ( ! authoritativeURL ) {
			return;
		}
		const noscripts = dom.querySelectorAll( 'noscript' );
		forEach( noscripts, ( noscript ) => {
			if ( ! noscript.firstChild ) {
				return;
			}

			const projectURL = noscript.querySelector( 'a' ).href;

			if ( projectURL.search( 'crowdsignal.net' ) < 0 ) {
				return;
			}
			const noscriptText = domForHtml( noscript.innerHTML ).innerText;
			const p = document.createElement( 'p' );
			const a = document.createElement( 'a' );
			try {
				a.href = new URL( authoritativeURL );
			} catch {
				//not a valid URL, skip it
				return;
			}
			a.target = '_blank';
			a.rel = 'external noopener noreferrer';
			a.innerText = noscriptText;
			p.appendChild( a );
			crowdsignalElement.removeChild( crowdsignalElement.firstElementChild );
			crowdsignalElement.appendChild( p );
		} );
	} );
	return post;
}
