import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

export default function HighlightCardsHeading( { children }: { children: React.ReactNode } ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	if ( ! hasEnTranslation( 'Updates every 30 minutes' ) ) {
		return null;
	}
	return (
		<div className="highlight-cards-heading__wrapper">
			<h3 className="highlight-cards-heading">{ children }</h3>
			<div className="highlight-cards-heading__update-frequency">
				<span>{ translate( 'Updates every 30 minutes' ) }</span>
			</div>
		</div>
	);
}
