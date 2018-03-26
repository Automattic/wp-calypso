/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External Dependencies
 */
import EventEmitter from 'events';

/**
 * Internal Dependencies
 */
import { History } from './history';
import { ViewerMessaging } from './viewer-messaging';
import { constructViewerCacheUrl } from './amp-url-creator';
import { log } from './utils/log';
import { parseUrl } from './utils/url';

/**
 * This file is a Viewer for AMP Documents.
 */
class Viewer extends EventEmitter {

	/**
	 * @param {!Element} hostElement the element to attatch the iframe to.
	 * @param {string} ampDocUrl the AMP Document url.
	 * @param {string} opt_referrer The referrer
	 * @param {boolean|undefined} opt_prerender Whether to pre-render the content
	 */
	constructor( hostElement, ampDocUrl, opt_referrer, opt_prerender ) {
		super();

		/** @private {ViewerMessaging} */
		this.viewerMessaging_ = null;

		/** @private {!Element} */
		this.hostElement_ = hostElement;

		/** @private {string} */
		this.ampDocUrl_ = ampDocUrl;

		/** @private {string} */
		this.referrer_ = opt_referrer;

		/** @private {boolean|undefined} */
		this.prerender_ = opt_prerender;

		/** @private {?Element} */
		this.iframe_ = null;

		/** @private {!History} */
		this.history_ = new History( this.handleChangeHistoryState_.bind( this ) );
	}

	/**
	 * @param {!Function} showViewer method that shows the viewer.
	 * @param {!Function} hideViewer method that hides the viewer.
	 * @param {!function():boolean} isViewerHidden method that determines if viewer is hidden.
	 */
	setViewerShowAndHide( showViewer, hideViewer, isViewerHidden ) {
		/** @private {!Function} */
		this.showViewer_ = showViewer;
		/** @private {!Function} */
		this.hideViewer_ = hideViewer;
		/** @private {!Function} */
		this.isViewerHidden_ = isViewerHidden;
	}

	/**
	 * @return {boolean} true if the viewer has already been loaded.
	 * @private
	 */
	isLoaded_() {
		return !! this.iframe_ && !! this.viewerMessaging_;
	}

	/**
	 * Attaches the AMP Doc Iframe to the Host Element.
	 */
	attach() {
		this.iframe_ = document.createElement( 'iframe' );
		// TODO (chenshay): iframe_.setAttribute('scrolling', 'no')
		// to enable the scrolling workarounds for iOS.

		this.buildIframeSrc_().then( ampDocCachedUrl => {
			this.viewerMessaging_ = new ViewerMessaging(
				window,
				this.iframe_,
				parseUrl( ampDocCachedUrl ).origin,
				this.messageHandler_.bind( this ) );

			this.viewerMessaging_.start().then( ()=>{
				log( 'this.viewerMessaging_.start() Promise resolved !!!' );
			} );

			this.iframe_.src = ampDocCachedUrl;
			this.hostElement_.appendChild( this.iframe_ );
			// this.history_.pushState( this.ampDocUrl_ );
		} );
	}

	/**
	 * @return {!Promise<string>} Promise that resolves to the iframe src
	 */
	buildIframeSrc_() {
		return new Promise( resolve => {
			constructViewerCacheUrl( this.ampDocUrl_, this.createInitParams_() ).then(
				viewerCacheUrl => {
					resolve( viewerCacheUrl );
				}
			);
		} );
	}

	/**
	 * Computes the init params that will be used to create the AMP Cache URL.
	 * @return {object} the init params.
	 * @private
	 */
	createInitParams_() {
		const parsedViewerUrl = parseUrl( window.location.href );

		const initParams = {
			origin: parsedViewerUrl.origin,
			cap: 'history',
		};

		if ( this.referrer_ ) {
			initParams.referrer = this.referrer_;
		}
		if ( this.prerender_ ) {
			initParams.visibilityState = 'prerender';
			initParams.prerenderSize = 1;
		}

		return initParams;
	}

	/**
	 * Detaches the AMP Doc Iframe from the Host Element
	 * and calls the hideViewer method.
	 */
	unAttach() {
		if ( this.hideViewer_ ) {
			this.hideViewer_();
		}
		this.hostElement_.removeChild( this.iframe_ );
		this.iframe_ = null;
		this.viewerMessaging_ = null;
	}

	/**
	 * @param {boolean} isLastBack true if back button was hit and viewer should hide.
	 * @param {boolean} isAMP true if going to AMP document.
	 * @private
		*/
	handleChangeHistoryState_( isLastBack, isAMP ) {
		if ( isLastBack ) {
			if ( this.hideViewer_ ) {
				this.hideViewer_();
			}
			return;
		}
		if ( isAMP && this.showViewer_ && this.isViewerHidden_ && this.isViewerHidden_() ) {
			this.showViewer_();
		}
	}

	/**
	 * Place holder message handler.
	 * @param {string} name Name of the message
	 * @param {*} data Data for the message
	 * @param {boolean} rsvp Whether we want a response
	 * @return {!Promise<*>|undefined} Resolves to the response or undefined
	 * @private
	 */
	messageHandler_( name, data, rsvp ) {
		log( 'messageHandler: ', name, data, rsvp );
		this.emit( name, data );
		switch ( name ) {
			case 'pushHistory':
				// this.history_.pushState( this.ampDocUrl_, data );
				return Promise.resolve();
			case 'popHistory':
				// this.history_.goBack();
				return Promise.resolve();
			case 'cancelFullOverlay':
			case 'documentLoaded':
			case 'documentHeight':
			case 'prerenderComplete':
			case 'requestFullOverlay':
			case 'scroll':
				return Promise.resolve();
			default:
				return Promise.reject( name + ' Message is not supported!' );
		}
	}
}

export default Viewer;
