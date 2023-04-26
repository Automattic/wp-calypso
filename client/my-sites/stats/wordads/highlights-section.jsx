import { Popover } from '@automattic/components';
import CountCard from '@automattic/components/src/highlight-cards/count-card';
import formatCurrency from '@automattic/format-currency';
import { Icon, info, payment, receipt, tip } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getWordAdsEarnings } from 'calypso/state/wordads/earnings/selectors';
import './highlights-section.scss';

function getAmountAsFormattedString( amount, stripZeros ) {
	return formatCurrency( amount, 'USD', {
		stripZeros: stripZeros !== undefined ? stripZeros : amount === 0,
	} );
}

function useHighlights( earnings ) {
	return useMemo( () => {
		const total = earnings?.total_earnings ? Number( earnings.total_earnings ) : 0;
		const owed = earnings?.total_amount_owed ? Number( earnings.total_amount_owed ) : 0;
		const paid = total - owed;

		const highlights = [
			{
				heading: translate( 'Earnings', { comment: 'Total WordAds earnings to date' } ),
				icon: <Icon icon={ payment } />,
				value: getAmountAsFormattedString( total ),
			},
			{
				heading: translate( 'Paid', {
					comment: 'Total WordAds earnings that have been paid out',
				} ),
				icon: <Icon icon={ receipt } />,
				value: getAmountAsFormattedString( paid ),
			},
			{
				heading: translate( 'Outstanding amount', {
					comment: 'Total WordAds earnings currently unpaid',
				} ),
				icon: <Icon icon={ tip } />,
				value: getAmountAsFormattedString( owed ),
			},
		];
		// Transform/index the data for use with React.
		return highlights.map( ( highlight, i ) => ( { id: i, ...highlight } ) );
	}, [ earnings ] );
}

function usePayoutNotices( earnings ) {
	return useMemo( () => {
		const amountOwed = earnings?.total_amount_owed || 0;
		const amountOwedFormatted = getAmountAsFormattedString( amountOwed );
		const amountThreshold = getAmountAsFormattedString( 100, true );
		const notice = {
			id: 'notice',
			value: translate(
				'Outstanding amount of %(amountOwed)s does not exceed the minimum %(amountThreshold)s needed to make the payment.',
				{
					comment: 'WordAds: Insufficient balance for payout.',
					args: { amountOwed: amountOwedFormatted, amountThreshold },
				}
			),
		};
		const limit = {
			id: 'limit',
			value: translate(
				'Payment will be made as soon as the total outstanding amount has reached %(amountThreshold)s.',
				{
					comment: 'WordAds: Payout limit description.',
					args: { amountThreshold },
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
	}, [ earnings ] );
}

function HighlightsSectionHeader( props ) {
	const notices = usePayoutNotices( props.earnings );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	const infoReferenceElement = useRef( null );
	const localizedTitle = translate( 'Totals', {
		comment: 'Heading for WordAds earnings highlights section',
	} );
	const showNotices = notices?.length > 0;
	return (
		<h3 className="highlight-cards-heading">
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
							{ notices?.map( ( notice ) => (
								<p key={ notice.id }>{ notice.value }</p>
							) ) }
						</div>
					</Popover>
				</>
			) }
		</h3>
	);
}

function HighlightsListing( props ) {
	const highlights = useHighlights( props.earnings );
	return (
		<div className="highlight-cards-list">
			{ highlights.map( ( highlight ) => (
				<CountCard
					key={ highlight.id }
					heading={ highlight.heading }
					icon={ highlight.icon }
					value={ highlight.value }
				/>
			) ) }
		</div>
	);
}

export default function HighlightsSection( props ) {
	const earningsData = useSelector( ( state ) => getWordAdsEarnings( state, props.siteId ) );

	// TODO: Retain business logic here and refactor presentational logic into highlight-cards.
	//       Maybe name it wordads-highlight-cards?
	return (
		<div className="highlight-cards wordads has-odyssey-stats-bg-color">
			<HighlightsSectionHeader earnings={ earningsData } />
			<HighlightsListing earnings={ earningsData } />
		</div>
	);
}
