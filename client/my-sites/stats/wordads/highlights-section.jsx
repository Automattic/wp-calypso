import { Gridicon } from '@automattic/components';
import { Icon, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import HighlightCardSimple from './highlight-card-simple';

// TODO: HighlightCard does not accept string values.
// Should refactor to accept strings and move the business logic into the callers.
// Then refactor this Comp to use HighlightCard again.

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
				<HighlightCardSimple
					heading={ translate( 'Earnings' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value="0"
				/>
				<HighlightCardSimple
					heading={ translate( 'Paid' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value="hi"
				/>
				<HighlightCardSimple
					heading={ translate( 'Outstanding amount' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value="bye!"
				/>
			</div>
		</div>
	);
}
