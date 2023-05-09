import { Card } from '@automattic/components';
import { PureComponent } from 'react';
import CardHeading from 'calypso/components/card-heading';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';

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
