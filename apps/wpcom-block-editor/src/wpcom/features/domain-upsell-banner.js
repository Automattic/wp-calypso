import domReady from '@wordpress/dom-ready';

domReady( function () {
	const awaitToolBar = setInterval( () => {
		const toolBar = document.querySelector( '.edit-post-header-toolbar' );
		if ( ! toolBar ) {
			return;
		}
		clearInterval( awaitToolBar );
		const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
		const launchButton = document.createElement( 'div' );
		launchButton.className = 'domain-upsell';
		launchButton.innerHTML =
			'<div class="domain-upsell__content">' +
			'<div class="domain-upsell__content-text">' +
			// '<Gridicon icon="globe" size={ 16 } className="domain-upsell__icon" />' +
			'<span class="domain-upsell__domain-name">gdemichelisnoplan.wordpress.com</span>' +
			'<a class="domain-upsell__button">Customize your domain</a>' +
			// '<Gridicon' +
			// 'icon="cross"' +
			// 'size={ 16 }' +
			// 'className="domain-upsell__dismiss-icon"' +
			// 'onClick={ getDismissClickHandler }' +
			// '/>' +
			'</div>' +
			'</div>' +
			'<style>' +
			'.domain-upsell {' +
			'	font-style: normal;' +
			'	padding: 15px;' +
			'	line-height: normal;' +
			'}' +
			'@media screen and (max-width: 940px) {' +
			'	.domain-upsell {' +
			'		display: none;' +
			'	}' +
			'}' +
			'.domain-upsell__content {' +
			'	width: 100%;' +
			'	display: flex;' +
			'	align-items: center;' +
			'	justify-content: center;' +
			'	color: var(--studio-gray-60);' +
			'}' +
			'.domain-upsell__content-text {' +
			'	display: flex;' +
			'	align-items: center;' +
			'	border-radius: 24px;' +
			'	padding: 6px 20px;' +
			'	column-gap: 10px;' +
			'	background: #f6f7f7;' +
			'}' +
			'.domain-upsell__icon {' +
			'	fill: var(--studio-gray-60);' +
			'}' +
			'.domain-upsell__button {' +
			'	white-space: nowrap;' +
			'	text-decoration: underline;' +
			'	color: #3858e9;' +
			'}' +
			'.domain-upsell__button:hover,' +
			'.domain-upsell__dismiss-icon:hover {' +
			'	cursor: pointer;' +
			'}';
		toolbarContainer.appendChild( launchButton );
	} );
} );
