/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PreviewRequired from './preview-required';

export default class extends React.Component {
	static displayName = 'PreviewLegend';

	render() {
		return (
			<legend>
				{ this.props.label }
				<PreviewRequired { ...this.props } />
			</legend>
		);
	}
}
