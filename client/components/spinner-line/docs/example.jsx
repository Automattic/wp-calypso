/**
 * External dependencies
 */
import React from 'react';
import PureComponent from 'react-pure-render/component';

/**
 * Internal dependencies
 */
import SpinnerLine from 'components/spinner-line';

export default class SpinnerLineExample extends PureComponent {
	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/spinner-line">SpinnerLine</a>
				</h2>
				<SpinnerLine />
			</div>
		);
	}
}

SpinnerLineExample.displayName = 'SpinnerLine';
