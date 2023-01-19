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

function HighlightsListing( props ) {
	// TODO: Adjust min-width as needed.
	// Current styling defaults to 180px which is not wide enough for more than 5 figures.
	// Should check the longest display string and update CSS class based on that.
	return (
		<div className="highlight-cards-list">
			{ props.highlights.map( ( highlight ) => (
				<HighlightCardSimple
					heading={ highlight.heading }
					icon={ <Icon icon={ starEmpty } /> }
					value={ highlight.amount }
				/>
			) ) }
		</div>
	);
}

export default function HighlightsSection( props ) {
	const translate = useTranslate();
	if ( ! props.isVisible ) {
		return null;
	}
	// TODO: Get data from API.
	const highlights = [
		{
			heading: translate( 'Earnings' ),
			icon: <Icon icon={ starEmpty } />,
			amount: '$153,841.29',
		},
		{
			heading: translate( 'Paid' ),
			icon: <Icon icon={ starEmpty } />,
			amount: '$153,841.29',
		},
		{
			heading: translate( 'Outstanding' ),
			icon: <Icon icon={ starEmpty } />,
			amount: '$0',
		},
		{
			heading: translate( 'Other' ),
			icon: <Icon icon={ starEmpty } />,
			amount: '$9.99',
		},
	];
	return (
		<div className="highlight-cards">
			<HighlightsSectionHeader showInfoIcon={ false } />
			<HighlightsListing highlights={ highlights } />
		</div>
	);
}
