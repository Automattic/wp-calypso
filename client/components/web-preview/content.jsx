import page from '@automattic/calypso-router';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import clsx from 'clsx';
import debugModule from 'debug';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { v4 as uuid } from 'uuid';
import SeoPreviewPane from 'calypso/components/seo-preview-pane';
import SpinnerLine from 'calypso/components/spinner-line';
import { addQueryArgs } from 'calypso/lib/route';
import { hasTouch } from 'calypso/lib/touch-detect';
import DomainUpsellCallout from '../domains/domain-upsell-callout';
import Toolbar from './toolbar';

import './style.scss';

const loadingTimeout = 3000;
const debug = debugModule( 'calypso:web-preview' );
const noop = () => {};

export default class WebPreviewContent extends Component {
	previewId = uuid();

	loadingTimeoutTimer = null;

	state = {
		iframeUrl: null,
		device: this.props.defaultViewportDevice || 'computer',
		viewport: null,
		iframeStyle: {},
		iframeScaleRatio: 1,
		loaded: false,
		isLoadingSubpage: false,
		isMobile: isWithinBreakpoint( '<660px' ),
		showIFrameOverlay: false,
	};

	setIframeInstance = ( ref ) => {
		this.iframe = ref;
	};

	componentDidMount() {
		window.addEventListener( 'message', this.handleMessage );
		if ( this.props.previewUrl ) {
			this.setIframeUrl( this.props.previewUrl );
		}
		if ( this.props.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		if ( this.props.fixedViewportWidth ) {
			this.handleResize();
			window.addEventListener( 'resize', this.handleResize );
		}

		this.props.onDeviceUpdate( this.state.device );

		this.unsubscribeMobileBreakpoint = subscribeIsWithinBreakpoint( '<660px', ( isMobile ) => {
			this.setState( { isMobile } );
		} );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.handleMessage );
		window.removeEventListener( 'resize', this.handleResize );
		this.unsubscribeMobileBreakpoint();
	}

	componentDidUpdate( prevProps, prevState ) {
		const { previewUrl, inlineCss, scrollToSelector } = this.props;
		const { loaded } = this.state;

		this.setIframeUrl( previewUrl );

		// If the previewMarkup changes, re-render the iframe contents
		if ( this.props.previewMarkup && this.props.previewMarkup !== prevProps.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		// If the previewMarkup is erased, remove the iframe contents
		if ( ! this.props.previewMarkup && prevProps.previewMarkup ) {
			debug( 'removing iframe contents' );
			this.setIframeMarkup( '' );
		}
		// Focus preview when showing modal
		if ( this.props.showPreview && ! prevProps.showPreview && this.state.loaded ) {
			this.focusIfNeeded();
		}

		// If the fixedViewportWidth changes, re-calculate the iframe styles.
		if ( this.props.fixedViewportWidth !== prevProps.fixedViewportWidth ) {
			if ( this.props.fixedViewportWidth && ! prevProps.fixedViewportWidth ) {
				this.handleResize();
				window.addEventListener( 'resize', this.handleResize );
			} else {
				this.resetResize();
				window.removeEventListener( 'resize', this.handleResize );
			}
		}

		if ( inlineCss && ! prevState.loaded && loaded ) {
			this.iframe.contentWindow?.postMessage(
				{
					channel: `preview-${ this.previewId }`,
					type: 'inline-css',
					inline_css: inlineCss,
				},
				'*'
			);
		}

		if ( scrollToSelector && loaded && ! prevState.loaded ) {
			this.iframe.contentWindow?.postMessage(
				{
					channel: `preview-${ this.previewId }`,
					type: 'scroll-to-selector',
					scroll_to_selector: scrollToSelector,
				},
				'*'
			);
		}
	}

	handleMessage = ( e ) => {
		let data;
		try {
			data = JSON.parse( e.data );
		} catch ( err ) {
			return;
		}

		if ( ! data || data.channel !== 'preview-' + this.previewId ) {
			return;
		}
		debug( 'message from iframe', data );

		switch ( data.type ) {
			case 'needs-auth':
				this.redirectToAuth();
				return;
			case 'link':
				page( data.payload.replace( /^https:\/\/wordpress\.com\//i, '/' ) );
				this.props.onClose();
				return;
			case 'close':
				this.props.onClose();
				return;
			case 'partially-loaded':
				this.setLoaded( 'iframe-message' );
				return;
			case 'location-change':
				this.handleLocationChange( data.payload );
				return;
			case 'focus':
				this.removeSelection();
				// we will fake a click here to close the dropdown
				this.wrapperElementRef && this.wrapperElementRef.click();
				return;
			case 'loading':
				this.setState( { isLoadingSubpage: true } );
				return;
			case 'page-dimensions-on-load':
			case 'page-dimensions-on-resize':
				if ( this.props.autoHeight || this.props.fixedViewportWidth ) {
					this.setState( { viewport: data.payload } );
				}
				return;
		}
	};

	handleResize = () => {
		const { fixedViewportWidth: vpw } = this.props;
		let iframeScaleRatio = 1;
		let iframeStyle = {};

		if ( ! this.iframe.parentElement?.clientWidth ) {
			this.resetResize();
			return;
		}

		iframeScaleRatio = this.iframe.parentElement.clientWidth / vpw;
		iframeStyle = {
			width: `${ vpw }px`,
			transform: `scale( ${ iframeScaleRatio } )`,
		};

		this.setState( { iframeStyle, iframeScaleRatio } );
	};

	resetResize = () => {
		this.setState( { iframeStyle: {}, iframeScaleRatio: 1 } );
	};

	redirectToAuth() {
		const { isPrivateAtomic, url } = this.props;
		if ( isPrivateAtomic ) {
			window.location.href =
				`${ url }/wp-login.php?redirect_to=` + encodeURIComponent( window.location.href );
		}
	}

	handleLocationChange = ( payload ) => {
		this.props.onLocationUpdate( payload.pathname );
		this.setState( { isLoadingSubpage: false } );
	};

	setWrapperElement = ( el ) => {
		this.wrapperElementRef = el;
	};

	removeSelection = () => {
		// remove all textual selections when user gives focus to preview iframe
		// they might be confusing
		if ( typeof window !== 'undefined' ) {
			if ( typeof window.getSelection === 'function' ) {
				const selection = window.getSelection();
				if ( typeof selection.empty === 'function' ) {
					selection.empty();
				} else if ( typeof selection.removeAllRanges === 'function' ) {
					selection.removeAllRanges();
				}
			} else if ( document.selection && typeof document.selection.empty === 'function' ) {
				document.selection.empty();
			}
		}
	};

	focusIfNeeded = () => {
		// focus content unless we are running in closed modal or on empty page
		if ( this.iframe.contentWindow && this.state.iframeUrl !== 'about:blank' ) {
			debug( 'focusing iframe contents' );
			this.iframe.contentWindow.focus();
		}
	};

	setIframeMarkup( content ) {
		if ( ! this.iframe ) {
			debug( 'no iframe to update' );
			return;
		}
		debug( 'adding markup to iframe', content.length );
		this.iframe.contentDocument.open();
		this.iframe.contentDocument.write( content );
		this.iframe.contentDocument.close();
	}

	setIframeUrl = ( iframeUrl ) => {
		if ( ! this.iframe || ( ! this.props.showPreview && this.props.isModalWindow ) ) {
			if ( this.state.iframeUrl !== 'about:blank' ) {
				this.setState( { iframeUrl: 'about:blank' } );
			}
			return;
		}

		// Bail if we've already set this url
		if ( iframeUrl === this.state.iframeUrl ) {
			return;
		}

		debug( 'setIframeUrl', iframeUrl );
		try {
			const newUrl =
				iframeUrl === 'about:blank'
					? iframeUrl
					: addQueryArgs( { calypso_token: this.previewId }, iframeUrl );
			this.iframe.contentWindow.location.replace( newUrl );

			this.setState( { iframeUrl } );

			const isHashChangeOnly =
				iframeUrl.replace( /#.*$/, '' ) === this.state.iframeUrl.replace( /#.*$/, '' );
			if ( ! isHashChangeOnly ) {
				this.setState( { loaded: false } );
			}
		} catch ( e ) {}
	};

	setDeviceViewport = ( device = 'computer' ) => {
		this.setState( { device } );

		this.props.recordTracksEvent( 'calypso_web_preview_select_viewport_device', { device } );

		if ( typeof this.props.onDeviceUpdate === 'function' ) {
			this.props.onDeviceUpdate( device );
		}
	};

	selectSEO = () => {
		this.setDeviceViewport( 'seo' );
	};

	setLoaded = ( caller ) => {
		if ( this.state.loaded && ! this.state.isLoadingSubpage ) {
			debug( 'already loaded' );
			return;
		}
		if ( ! this.state.iframeUrl && ! this.props.previewMarkup ) {
			debug( 'preview loaded, but nothing to show' );
			return;
		}
		if ( this.props.previewMarkup ) {
			debug( 'preview loaded with markup' );
			this.props.onLoad( this.iframe.contentDocument );
		} else {
			debug( 'preview loaded for url:', this.state.iframeUrl );
		}
		if ( this.checkForIframeLoadFailure( caller ) ) {
			debug( `preview not loaded yet, waiting ${ loadingTimeout }ms` );
			clearTimeout( this.loadingTimeoutTimer );

			// To prevent iframe firing the onload event before the embedded page sends the
			// partially-loaded message, we add a waiting period here.
			if ( ! this.props.disableTimeoutRedirect ) {
				this.loadingTimeoutTimer = setTimeout( () => {
					debug( 'preview loading timeout' );

					if ( this.props.showClose ) {
						window.open( this.state.iframeUrl, '_blank' );
						this.props.onClose();
					} else {
						window.location.replace( this.state.iframeUrl );
					}
				}, loadingTimeout );
			}
		} else {
			this.setState( { loaded: true, isLoadingSubpage: false } );
			if ( this.loadingTimeoutTimer ) {
				debug( 'preview loaded before timeout' );
				clearTimeout( this.loadingTimeoutTimer );
			}
		}

		this.focusIfNeeded();

		// If the preview is loaded and the site is private atomic, there's a chance we ended up on
		// "you need to login first" screen. These messages are handled by wpcomsh on the other end,
		// and they make it possible to redirect to wp-login.php since it cannot be displayed in this
		// iframe OR redirected to using <a href="" target="_top">.
		if ( this.props.isPrivateAtomic ) {
			const { protocol, host } = new URL( this.props.externalUrl );
			this.iframe.contentWindow.postMessage( { connected: 'calypso' }, `${ protocol }//${ host }` );
		}
	};

	// In cases where loading of the iframe content is blocked by the browser for cross-origin reasons the
	// iframe onload event is still fired, so we need to validate that the actual content was loaded by seeing
	// if state.loaded was set to true by the receipt of a postMessage from the iframe. The check for
	// 'about:blank' prevents the check for failing in the context of previews in the block editor  - in this
	// context a postMessage is not received from the iframe.
	checkForIframeLoadFailure( caller ) {
		return (
			caller === 'iframe-onload' && ! this.state.loaded && this.state.iframeUrl !== 'about:blank'
		);
	}

	render() {
		const {
			translate,
			toolbarComponent: ToolbarComponent,
			fetchpriority,
			autoHeight,
			disableTabbing,
			themeId,
			themeOptions,
		} = this.props;
		const isLoaded = this.state.loaded && ( ! autoHeight || this.state.viewport !== null );

		const className = clsx( this.props.className, 'web-preview__inner', {
			'is-touch': hasTouch(),
			'is-with-sidebar': this.props.hasSidebar,
			'is-visible': this.props.showPreview,
			'is-computer': this.state.device === 'computer',
			'is-tablet': this.state.device === 'tablet',
			'is-phone': this.state.device === 'phone',
			'is-seo': this.state.device === 'seo',
			'is-fixed-viewport-width': !! this.props.fixedViewportWidth,
			'is-loaded': isLoaded,
		} );

		const showLoadingMessage =
			! isLoaded &&
			this.props.loadingMessage &&
			( this.props.showPreview || ! this.props.isModalWindow ) &&
			this.state.device !== 'seo';

		return (
			<div className={ className } ref={ this.setWrapperElement }>
				<ToolbarComponent
					setDeviceViewport={ this.setDeviceViewport }
					device={ this.state.device }
					{ ...this.props }
					showExternal={ this.props.previewUrl ? this.props.showExternal : false }
					showEditHeaderLink={ this.props.showEditHeaderLink }
					showDeviceSwitcher={ this.props.showDeviceSwitcher && ! this.state.isMobile }
					showUrl={ this.props.showUrl && isWithinBreakpoint( '>960px' ) }
					selectSeoPreview={ this.selectSEO }
					isLoading={ this.state.isLoadingSubpage }
					isSticky={ this.props.isStickyToolbar }
					themeId={ themeId }
					previewSource={ themeOptions?.previewSource }
				/>
				{ this.props.showExternal && this.props.isModalWindow && ! this.props.isPrivateAtomic && (
					<DomainUpsellCallout trackEvent="site_preview_domain_upsell_callout" />
				) }
				{ this.props.belowToolbar }
				{ ( ! isLoaded || this.state.isLoadingSubpage ) && <SpinnerLine /> }
				<div
					className="web-preview__placeholder"
					style={
						this.state.viewport
							? { minHeight: this.state.viewport.height * this.state.iframeScaleRatio }
							: null
					}
				>
					{ showLoadingMessage && (
						<div className="web-preview__loading-message-wrapper">
							<span className="web-preview__loading-message">{ this.props.loadingMessage }</span>
						</div>
					) }
					{ 'seo' !== this.state.device && (
						<div
							className={ clsx( 'web-preview__frame-wrapper', {
								'is-resizable': ! this.props.isModalWindow,
							} ) }
						>
							<iframe
								ref={ this.setIframeInstance }
								className="web-preview__frame"
								style={ {
									...this.state.iframeStyle,
									height: this.state.viewport?.height,
									pointerEvents: 'all',
								} }
								src="about:blank"
								onLoad={ () => this.setLoaded( 'iframe-onload' ) }
								title={ this.props.iframeTitle || translate( 'Preview' ) }
								fetchpriority={ fetchpriority ? fetchpriority : undefined }
								scrolling={ autoHeight ? 'no' : undefined }
								tabIndex={ disableTabbing ? -1 : 0 }
								/* See https://help.hotjar.com/hc/en-us/articles/115011624347-Can-I-Track-iframes-Inside-Heatmaps-and-Recordings- */
								data-hj-allow-iframe
							/>
						</div>
					) }
					{ 'seo' === this.state.device && (
						<SeoPreviewPane
							overridePost={ this.props.overridePost }
							frontPageMetaDescription={ this.props.frontPageMetaDescription }
						/>
					) }
				</div>
			</div>
		);
	}
}

WebPreviewContent.propTypes = {
	// Additional elements to display below the toolbar
	belowToolbar: PropTypes.element,
	// Prevents tabbing into the iframe.
	disableTabbing: PropTypes.bool,
	// Display the preview
	showPreview: PropTypes.bool,
	// Show external link button
	showExternal: PropTypes.bool,
	// Show external link with clipboard input
	showUrl: PropTypes.bool,
	// Show close button
	showClose: PropTypes.bool,
	// Show SEO button
	showSEO: PropTypes.bool,
	// Show device viewport switcher
	showDeviceSwitcher: PropTypes.bool,
	// Show edit button
	showEdit: PropTypes.bool,
	// Show edit the header link button
	showEditHeaderLink: PropTypes.bool,
	// The URL for the edit button
	editUrl: PropTypes.string,
	// The URL that should be displayed in the iframe
	previewUrl: PropTypes.string,
	// The URL for the external link button
	externalUrl: PropTypes.string,
	// The markup to display in the iframe
	previewMarkup: PropTypes.string,
	// The viewport device to show initially
	defaultViewportDevice: PropTypes.string,
	// Elements to render on the right side of the toolbar
	children: PropTypes.node,
	// The function to call when the iframe is loaded. Will be passed the iframe document object.
	// Only called if using previewMarkup.
	onLoad: PropTypes.func,
	// Called when the iframe's location updates
	onLocationUpdate: PropTypes.func,
	// Called when the preview is closed, either via the 'X' button or the escape key
	onClose: PropTypes.func,
	// Called when the edit button is clicked
	onEdit: PropTypes.func,
	// Optional loading message to display during loading
	loadingMessage: PropTypes.node,
	// The iframe's title element, used for accessibility purposes
	iframeTitle: PropTypes.string,
	// Makes room for a sidebar if desired
	hasSidebar: PropTypes.bool,
	// Called after user switches device
	onDeviceUpdate: PropTypes.func,
	// Flag that differentiates modal window from inline embeds
	isModalWindow: PropTypes.bool,
	// The site/post description passed to the SeoPreviewPane
	frontPageMetaDescription: PropTypes.string,
	// A post object used to override the selected post in the SEO preview
	overridePost: PropTypes.object,
	// A customized Toolbar element
	toolbarComponent: PropTypes.elementType,
	// iframe's fetchpriority.
	fetchpriority: PropTypes.string,
	// Set height based on page content. This requires the page to post it's dimensions as message.
	autoHeight: PropTypes.bool,
	// The toolbar should sticky or not
	isStickyToolbar: PropTypes.bool,
	// Fixes the viewport width of the iframe if provided.
	fixedViewportWidth: PropTypes.number,
	// Injects CSS in the iframe after the content is loaded.
	inlineCss: PropTypes.string,
	// Uses the CSS selector to scroll to it
	scrollToSelector: PropTypes.string,
	// disable the redirection due to the timeout
	disableTimeoutRedirect: PropTypes.bool,
	themeId: PropTypes.string,
	themeOptions: PropTypes.object,
};

WebPreviewContent.defaultProps = {
	belowToolbar: null,
	showExternal: true,
	showClose: true,
	showSEO: true,
	showDeviceSwitcher: true,
	showEdit: false,
	showEditHeaderLink: false,
	editUrl: null,
	previewUrl: null,
	previewMarkup: null,
	onLoad: noop,
	onLocationUpdate: noop,
	onClose: noop,
	onEdit: noop,
	onDeviceUpdate: noop,
	hasSidebar: false,
	isModalWindow: false,
	overridePost: null,
	toolbarComponent: Toolbar,
	autoHeight: false,
	inlineCss: null,
	scrollToSelector: null,
	disableTimeoutRedirect: false,
};
