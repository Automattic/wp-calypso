/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SpinnerButton from '../index';

export default class SpinnerButtonExample extends Component {
	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/domain-tip">Spinner Button</a>
				</h2>
				<div>
					<SpinnerButton text="Default Text" />
				</div>
				<div>
					<SpinnerButton loadingText="Loading" loading />
				</div>
			</div>
		);
	}
}
