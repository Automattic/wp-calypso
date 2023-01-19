import { Gridicon } from '@automattic/components';
import { Icon, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import HighlightCardSimple from './highlight-card-simple';

// TODO: HighlightCard does not accept string values.
// Should refactor to accept strings and move the business logic into the callers.
// Then refactor this Comp to use HighlightCard again.

function HighlightsSectionHeader( props ) {
	const translate = useTranslate();
	const localizedTitle = translate( 'Totals' );
	return props.showInfoIcon ? (
		<h1 className="highlight-cards-heading">
			{ localizedTitle } <Gridicon icon="info-outline" />
		</h1>
	) : (
		<h1 className="highlight-cards-heading">{ localizedTitle }</h1>
	);
}

export default function HighlightsSection( props ) {
	const translate = useTranslate();
	if ( ! props.isVisible ) {
		return null;
	}
	return (
		<div className="highlight-cards">
			<HighlightsSectionHeader showInfoIcon={ false } />
			<div className="highlight-cards-list">
				<HighlightCardSimple
					heading={ translate( 'Earnings' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value="$563.76"
				/>
				<HighlightCardSimple
					heading={ translate( 'Paid' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value="$500.35"
				/>
				<HighlightCardSimple
					heading={ translate( 'Outstanding amount' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value="$63.41"
				/>
			</div>
		</div>
	);
}
