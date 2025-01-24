import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Main from 'calypso/components/main';

export function ReceiptPlaceholder() {
	const translate = useTranslate();

	return (
		<Main wideLayout className="receipt">
			<Card className="content is-placeholder">
				<div className="header">
					<div className="placeholder-title" aria-label={ translate( 'Loading receipt' ) } />
				</div>
				<div className="body">
					<div className="placeholder-content" />
				</div>
			</Card>
		</Main>
	);
}
