import { getCalypsoUrl } from '@automattic/calypso-url';
import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';

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

function showDomainUpsell() {
	const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
	const launchButton = document.createElement( 'div' );
	const launchButtonStyle = document.createElement( 'style' );
	const launchButtonScript = document.createElement( 'script' );
	const siteSlug = window.location.hostname;
	const target = getCalypsoUrl() === 'https://wordpress.com' ? '_parent' : '_self';

	launchButton.className = 'domain-upsell-callout';
	launchButton.innerHTML = `
	<div class="domain-upsell-callout__content">
	<div class="domain-upsell-callout__content-text">
	<span class="domain-upsell-callout__domain-name">gdemichelisnoplan.wordpress.com</span>
	<a class="domain-upsell-callout__button">Customize your domain</a>
	</div>
	</div>
	`;

	launchButtonStyle.innerHTML = `
	.domain-upsell-callout {
		font-style: normal;
		padding: 15px;
		line-height: normal;
		position: absolute;
		display: flex;
		align-items: center;
		left: 50%;
		transform: translateX(-50%);
		top: 0;
	}
	.domain-upsell-callout__content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--studio-gray-60);
	}
	.domain-upsell-callout__content-text {
		display: flex;
		align-items: center;
		border-radius: 24px;
		padding: 6px 20px;
		column-gap: 10px;
		background: #f6f7f7;
	}
	.domain-upsell-callout__icon {
		fill: var(--studio-gray-60);
	}
	.domain-upsell-callout__button {
		white-space: nowrap;
		text-decoration: underline;
		color: #3858e9;
	}
	.domain-upsell-callout__button:hover,
	.domain-upsell-callout__dismiss-icon:hover {
		cursor: pointer;
	};
	`;

	launchButtonScript.innerHTML = `
	(function() {
		var launchButton = document.querySelector( '.domain-upsell-callout__button' );
		launchButton.addEventListener( 'click', function() {
			window.open( 'https://wordpress.com/domains/add/${ siteSlug }?domainAndPlanPackage=true', '${ target }' );
		} );
	})();
	`;
	toolbarContainer.appendChild( launchButton );
	toolbarContainer.appendChild( launchButtonStyle );
	toolbarContainer.appendChild( launchButtonScript );
}

domReady( async function () {
	await whenEditorIsReady();
	if ( shouldShowDomainUpsell() ) {
		showDomainUpsell();
	}
} );
