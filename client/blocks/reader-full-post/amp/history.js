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
 * Internal Dependencies
 */
import { parseUrl } from './utils/url';

/**
 * This file manages history for the Viewer.
 */
export class History {
	/**
	 * @param {!Function} handleChangeHistoryState what to do when the history
	 *  state changes.
	 */
	constructor( handleChangeHistoryState ) {
		/** @private {!Function} */
		this.handleChangeHistoryState_ = handleChangeHistoryState;

		this.init_();
	}

	/**
	 * Init the onpopstate listener.
	 * @private
	 */
	init_() {
		window.addEventListener( 'popstate', event => {
			const state = event.state;
			if ( ! state ) {
				this.handleChangeHistoryState_(
					true /* isLastBack */,
					false /* isAMP */ );
				return;
			}

			this.handleChangeHistoryState_(
				false /* isLastBack */,
				!! state.isAMP );
		} );
	}

	/**
	 * Init the onpopstate listener.
	 * @param {string} url The url to push onto the Viewer history.
	 */
	pushState( url ) {
		const stateData = {
			urlPath: url,
			isAMP: true,
		};

		// The url should have /amp/ + url added to it. For example:
		// example.com -> example.com/amp/s/www.ampproject.org
		// TODO(chenshay): Include path & query parameters.
		const parsedUrl = parseUrl( url );
		let urlStr = '/amp/';
		if ( parsedUrl.protocol === 'https:' ) {
			urlStr += 's/';
		}
		urlStr += parsedUrl.host;
		history.pushState( stateData, '', urlStr );
	}

	/**
	 * Go back to the previous history state.
	 */
	goBack() {
		history.back();
	}

	/**
	 * Go forward to the next history state.
	 */
	goForward() {
		history.forward();
	}
}
