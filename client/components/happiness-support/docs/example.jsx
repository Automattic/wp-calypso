import { Card } from '@automattic/components';
import { Component } from 'react';
import HappinessSupport from 'calypso/components/happiness-support';

export default class extends Component {
	static displayName = 'HappinessSupport';

	render() {
		return (
			<Card>
				<HappinessSupport />
			</Card>
		);
	}
}
