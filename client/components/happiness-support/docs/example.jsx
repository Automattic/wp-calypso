/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocsExample from 'components/docs-example';
import HappinessSupport from 'components/happiness-support';

export default React.createClass( {
	displayName: 'HappinessSupport',

	render() {
		return (
			<DocsExample
				title="HappinessSupport"
				url="/devdocs/design/happiness-support"
				componentUsageStats={ this.props.getUsageStats( HappinessSupport ) }
			>
				<Card>
					<HappinessSupport />
				</Card>
			</DocsExample>
		);
	}
} );
