import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Main from 'calypso/components/main';

export function ReceiptPlaceholder() {
	const translate = useTranslate();

	return (
		<Main wideLayout className="receipt">
			<Card className="receipt__content is-placeholder">
				<div className="receipt__header">
					<div
						className="receipt__placeholder-title"
						aria-label={ translate( 'Loading receipt' ) }
					/>
				</div>
				<div className="receipt__body">
					<div className="receipt__placeholder-content" />
				</div>
			</Card>
		</Main>
	);
}
