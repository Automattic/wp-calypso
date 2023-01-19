import { Gridicon } from '@automattic/components';
import { Icon, starEmpty } from '@wordpress/icons';
import { numberFormat, translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getWordAdsEarnings } from 'calypso/state/wordads/earnings/selectors';
import HighlightCardSimple from './highlight-card-simple';

// TODO: HighlightCard does not accept string values.
// Should refactor to accept strings and move the business logic into the callers.
// Then refactor this Comp to use HighlightCard again.

function getAmountAsFormattedString( amount ) {
	// Takes a Number, formats it to 2 decimal places, and prepends a "$".
	// This mimics the existing behaviour. I'm assuming we only view/report
	// on earnings in USD.
	const formattedAmount = '$' + numberFormat( amount, 2 );
	// Differs from previous behaviour in that we don't want "$0.00" as a result.
	// Per design spec we'll return "$0" in this scenario.
	// https://github.com/Automattic/wp-calypso/issues/72045
	return formattedAmount === '$0.00' ? '$0' : formattedAmount;
}

function getHighlights( earnings ) {
	const total = earnings && earnings.total_earnings ? Number( earnings.total_earnings ) : 0;
	const owed = earnings && earnings.total_amount_owed ? Number( earnings.total_amount_owed ) : 0;
	const paid = total - owed;

	const highlights = [
		{
			heading: translate( 'Earnings', { context: 'Total WordAds earnings to date' } ),
			amount: total,
		},
		{
			heading: translate( 'Paid', {
				context: 'Total WordAds earnings that have been paid out',
			} ),
			amount: paid,
		},
		{
			heading: translate( 'Outstanding amount', {
				context: 'Total WordAds earnings currently unpaid',
			} ),
			amount: owed,
		},
	];
	// Transform/index the data for use with React.
	return highlights.map( ( highlight, i ) => ( {
		id: i,
		formattedAmount: getAmountAsFormattedString( highlight.amount ),
		icon: <Icon icon={ starEmpty } />,
		...highlight,
	} ) );
}

function HighlightsSectionHeader( props ) {
	// TODO: Add support for popup.
	const localizedTitle = translate( 'Totals', {
		context: 'Heading for WordAds earnings highlights section',
	} );
	return props.showInfoIcon ? (
		<h1 className="highlight-cards-heading">
			{ localizedTitle } <Gridicon icon="info-outline" />
		</h1>
	) : (
		<h1 className="highlight-cards-heading">{ localizedTitle }</h1>
	);
}

function HighlightsListing( props ) {
	return (
		<div className="highlight-cards-list">
			{ props.highlights.map( ( highlight ) => (
				<HighlightCardSimple
					key={ highlight.id }
					heading={ highlight.heading }
					icon={ highlight.icon }
					value={ highlight.formattedAmount }
				/>
			) ) }
		</div>
	);
}

export default function HighlightsSection( props ) {
	const earningsData = useSelector( ( state ) => getWordAdsEarnings( state, props.siteId ) );
	if ( ! props.isVisible ) {
		return null;
	}
	const highlights = getHighlights( earningsData );
	return (
		<div className="highlight-cards wordads">
			<HighlightsSectionHeader showInfoIcon={ false } />
			<HighlightsListing highlights={ highlights } />
		</div>
	);
}
