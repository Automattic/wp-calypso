/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import CardHeading from 'calypso/components/card-heading';
import { Card } from '@automattic/components';

class LayoutExample extends PureComponent {
	static displayName = 'LayoutExample';
	render() {
		return (
			<Layout>
				<Column type="main">
					<Card>
						<CardHeading>Main column</CardHeading>
						<p>This is the main column.</p>
					</Card>
				</Column>

				<Column type="sidebar">
					<Card>This is the sidebar.</Card>
				</Column>
			</Layout>
		);
	}
}

export default LayoutExample;
