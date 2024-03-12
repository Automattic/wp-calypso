import { Card } from '../..';
import ExternalLink from './index';

export default { title: 'packages/components/ExternalLink' };

export const Default = () => (
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
