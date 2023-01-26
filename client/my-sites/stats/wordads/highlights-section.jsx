import { Popover } from '@automattic/components';
import { Icon, info, payment, receipt, tip } from '@wordpress/icons';
import { numberFormat, translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
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
	const total = earnings?.total_earnings ? Number( earnings.total_earnings ) : 0;
	const owed = earnings?.total_amount_owed ? Number( earnings.total_amount_owed ) : 0;
	const paid = total - owed;

	const highlights = [
		{
			heading: translate( 'Earnings', { comment: 'Total WordAds earnings to date' } ),
			icon: <Icon icon={ payment } />,
			amount: total,
		},
		{
			heading: translate( 'Paid', {
				comment: 'Total WordAds earnings that have been paid out',
			} ),
			icon: <Icon icon={ receipt } />,
			amount: paid,
		},
		{
			heading: translate( 'Outstanding amount', {
				comment: 'Total WordAds earnings currently unpaid',
			} ),
			icon: <Icon icon={ tip } />,
			amount: owed,
		},
	];
	// Transform/index the data for use with React.
	return highlights.map( ( highlight, i ) => ( {
		id: i,
		formattedAmount: getAmountAsFormattedString( highlight.amount ),
		...highlight,
	} ) );
}

function payoutNotices( earnings ) {
	const amountOwed = earnings?.total_amount_owed || 0;
	const amountOwedFormatted = getAmountAsFormattedString( amountOwed );
	const notice = {
		id: 'notice',
		value: translate(
			'Outstanding amount of %(amountOwed)s does not exceed the minimum $100 needed to make the payment.',
			{
				comment: 'WordAds: Insufficient balance for payout.',
				args: { amountOwed: amountOwedFormatted },
			}
		),
	};
	const limit = {
		id: 'limit',
		value: translate(
			'Payment will be made as soon as the total outstanding amount has reached $100.',
			{
				comment: 'WordAds: Payout limit description.',
			}
		),
	};
	const payout = {
		id: 'payout',
		value: translate(
			'Outstanding amount of %(amountOwed)s will be paid approximately 45 days following the end of the month in which it was earned.',
			{
				comment: 'WordAds: Payout will proceed.',
				args: { amountOwed: amountOwedFormatted },
			}
		),
	};
	return amountOwed < 100 ? [ notice, limit ] : [ payout ];
}

function HighlightsSectionHeader( props ) {
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	const infoReferenceElement = useRef( null );
	const localizedTitle = translate( 'Totals', {
		comment: 'Heading for WordAds earnings highlights section',
	} );
	const showNotices = props?.notices?.length > 0;
	return (
		<h1 className="highlight-cards-heading">
			{ localizedTitle }{ ' ' }
			{ showNotices && (
				<>
					<span
						className="info-wrapper"
						ref={ infoReferenceElement }
						onMouseEnter={ () => setTooltipVisible( true ) }
						onMouseLeave={ () => setTooltipVisible( false ) }
					>
						<Icon className="info-icon" icon={ info } />
					</span>
					<Popover
						className="tooltip tooltip--darker tooltip-wordads highlight-card-tooltip"
						isVisible={ isTooltipVisible }
						position="bottom right"
						context={ infoReferenceElement.current }
					>
						<div className="highlight-card-tooltip-content">
							{ props.notices.map( ( notice ) => (
								<p key={ notice.id }>{ notice.value }</p>
							) ) }
						</div>
					</Popover>
				</>
			) }
		</h1>
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
	const highlights = getHighlights( earningsData );
	const notices = payoutNotices( earningsData );
	return (
		<div className="highlight-cards wordads">
			<HighlightsSectionHeader notices={ notices } />
			<HighlightsListing highlights={ highlights } />
		</div>
	);
}
