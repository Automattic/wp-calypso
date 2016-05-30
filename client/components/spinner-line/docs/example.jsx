/**
 * External dependencies
 */
import React from 'react';
import PureComponent from 'react-pure-render/component';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import SpinnerLine from 'components/spinner-line';

export default class SpinnerLineExample extends PureComponent {
	render() {
		return (
			<DocsExample
				title="SpinnerLine"
				url="/devdocs/design/spinner-line"
				componentUsageStats={ this.props.getUsageStats( SpinnerLine ) }
			>
				<SpinnerLine />
			</DocsExample>
		);
	}
}

SpinnerLineExample.displayName = 'SpinnerLine';
