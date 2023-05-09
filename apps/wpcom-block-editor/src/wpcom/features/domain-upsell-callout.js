import { getCalypsoUrl } from '@automattic/calypso-url';
import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { createElement } from 'react';
import { render } from 'react-dom';

import './domain-upsell-callout.scss';

function whenEditorIsReady() {
	return new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			// This will trigger after the initial render blocking, before the window load event
			// This seems currently more reliable than using __unstableIsEditorReady
			if (
				select( 'core/editor' ).isCleanNewPost() ||
				select( 'core/block-editor' ).getBlockCount() > 0
			) {
				unsubscribe();
				resolve();
			}
		} );
	} );
}

function shouldShowDomainUpsell() {
	const postType = select( 'core/editor' ).getCurrentPostType();
	return postType === 'post' || postType === 'page';
}
function DomainUpsell() {
	const siteSlug = window.location.hostname;
	const target = getCalypsoUrl() === 'https://wordpress.com' ? '_parent' : '_self';

	function handleClick() {
		window.open(
			`https://wordpress.com/domains/add/${ siteSlug }?domainAndPlanPackage=true`,
			target
		);
	}

	return (
		<div className="domain-upsell-callout">
			<div className="domain-upsell-callout__content">
				<div className="domain-upsell-callout__content-text">
					<span className="domain-upsell-callout__domain-name">{ siteSlug }</span>
					{ /* We can only use <a> here because the button somehow just disappears from the page */ }
					{ /* eslint-disable-next-line */ }
					<a className="domain-upsell-callout__button" role="button" onClick={ handleClick }>
						Customize your domain
					</a>
				</div>
			</div>
		</div>
	);
}

domReady( async function () {
	await whenEditorIsReady();
	if ( shouldShowDomainUpsell() ) {
		const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
		render( createElement( DomainUpsell ), toolbarContainer );
	}
} );
