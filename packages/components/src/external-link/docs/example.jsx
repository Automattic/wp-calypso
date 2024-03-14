import { Component } from 'react';
import ExternalLink from '../';
import { Card } from '../../';

export default class extends Component {
	static displayName = 'ExternalLink';

	render() {
		return (
			<Card>
				<p>
					<ExternalLink icon={ true } href="https://wordpress.org">
						WordPress.org
					</ExternalLink>
				</p>
				<p>
					<ExternalLink showIconFirst={ true } icon={ true } href="https://wordpress.org">
						WordPress.org
					</ExternalLink>
				</p>
				<p>
					<ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink>
				</p>
			</Card>
		);
	}
}
