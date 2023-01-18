import { Gridicon, HighlightCard } from '@automattic/components';
import { Icon, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

// TODO: HighlightCard does not accept string values.
// Should refactor to accept strings and move the business logic into the callers.

export default function HighlightsSection( props ) {
	const translate = useTranslate();
	if ( ! props.isVisible ) {
		return null;
	}
	return (
		<div className="highlight-cards">
			<h1 className="highlight-cards-heading">
				{ translate( 'Totals' ) } <Gridicon icon="info-outline" />
			</h1>
			<div className="highlight-cards-list">
				<HighlightCard
					heading={ translate( 'Earnings' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ 0 }
				/>
				<HighlightCard
					heading={ translate( 'Paid' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ 0 }
				/>
				<HighlightCard
					heading={ translate( 'Outstanding amount' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ 0 }
				/>
			</div>
		</div>
	);
}
