import { Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export function SettingsPanel() {
	const translate = useTranslate();
	return (
		<Card>
			<CardBody>
				<h2>{ translate( 'Settings' ) }</h2>
				<p>{ translate( 'Account settings will appear here. We’re still building this part.' ) }</p>
			</CardBody>
		</Card>
	);
}
