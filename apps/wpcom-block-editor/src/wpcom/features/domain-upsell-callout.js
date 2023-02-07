import domReady from '@wordpress/dom-ready';

domReady( function () {
	const awaitToolBar = setInterval( () => {
		const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
		if ( ! toolbarContainer ) {
			return;
		}
		clearInterval( awaitToolBar );
		const launchButton = document.createElement( 'div' );
		const launchButtonStyle = document.createElement( 'style' );
		const launchButtonScript = document.createElement( 'script' );

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
				window.open( 'https://wordpress.com/domains/manage/gdemichelisnoplan.wordpress.com?source=editor', '_blank' );
			} );
		})();
		`;
		toolbarContainer.appendChild( launchButton );
		toolbarContainer.appendChild( launchButtonStyle );
		toolbarContainer.appendChild( launchButtonScript );
	} );
} );
