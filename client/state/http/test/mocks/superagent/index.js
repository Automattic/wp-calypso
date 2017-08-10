/**
 * External dependencies
 */
import sinon from 'sinon';

class SuperAgentMock {
	constructor() {
		this._success = false;
		this._data = new Error( 'Mock response is not set' );
		this._lastRequest = null;
	}

	/***
	 * Mocks superagent() call that returns request
	 *
	 * const request = superagent( method, url );
	 *
	 * @param {String} method HTTP method
	 * @param {String} url URL
	 * @returns {Object} superagent like request with sinon spies
	 */
	handler = ( method, url ) => {
		const request = {
			method,
			url,
			withCredentials: sinon.spy(),
			set: sinon.spy(),
			query: sinon.spy(),
			accept: sinon.spy(),
			send: sinon.spy(),
			then: ( successHandler, failureHandler ) =>
				this._success
					? successHandler( { body: this._data } )
					: failureHandler( { response: { body: this._data } } ),
		};

		this._lastRequest = request;

		return request;
	};

	/***
	 * Tells the mock how to act, successful response or failure
	 *
	 * @param {Boolean} success should the request call success handler or failure?
	 * @param {Object} data the data that should be passed in body
	 */
	setResponse( success, data ) {
		this._success = success;
		this._data = data;
	}

	/***
	 * Get last mocked request
	 * @returns {Object} An object similar to superagent's request with additional `method` and `url` fields
	 */
	getLastRequest() {
		return this._lastRequest;
	}
}

export default new SuperAgentMock();
