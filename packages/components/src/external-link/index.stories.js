import { ExternalLink, Card } from '../..';

export default { title: 'packages/components/external-link' };

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
