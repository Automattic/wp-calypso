/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

export default class extends Component {
	render() {
		return (
			<div>
				<h5 className="preferences-helper__preference-header">{ 'Preference Name' }</h5>
				<div className="preferences-helper__info">
					<p>{ 'Unset Preference' }</p>
				</div>
			</div>
		);
	}
}
