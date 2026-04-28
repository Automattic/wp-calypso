import { Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export function TimelinePanel() {
	const translate = useTranslate();
	return (
		<Card>
			<CardBody>
				<h2>{ translate( 'Timeline' ) }</h2>
				<p>
					{ translate(
						'Your Mastodon timeline will appear here. We’re still building this part.'
					) }
				</p>
			</CardBody>
		</Card>
	);
}
