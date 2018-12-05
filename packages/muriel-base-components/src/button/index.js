/** @format */

/**
 * External dependencies
 *
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */

/**
 * The base Muriel button
 *
 * @export
 * @param {*} props The props to use
 * @returns {React.ReactElement} a rendered Button
 */
export class Button extends Component {
	render() {
		return <button className="muriel-button">{ this.props.children }</button>;
	}
}
