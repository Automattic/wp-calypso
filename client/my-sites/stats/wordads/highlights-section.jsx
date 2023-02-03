import { Popover } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getWordAdsEarnings } from 'calypso/state/wordads/earnings/selectors';
import HighlightCardSimple from './highlight-card-simple';
import { getEarningsSummaries, getPayoutNotices, highlightIconById } from './utils';

// TODO: HighlightCard does not accept string values.
// Should refactor to accept strings and move the business logic into the callers.
// Then refactor this Comp to use HighlightCard again.

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
					icon={ <Icon icon={ highlightIconById[ highlight.id ] } /> }
					value={ highlight.formattedAmount }
				/>
			) ) }
		</div>
	);
}

export default function HighlightsSection( props ) {
	const earningsData = useSelector( ( state ) => getWordAdsEarnings( state, props.siteId ) );
	const highlights = getEarningsSummaries( earningsData );
	const notices = getPayoutNotices( earningsData );
	return (
		<div className="highlight-cards wordads has-background-color">
			<HighlightsSectionHeader notices={ notices } />
			<HighlightsListing highlights={ highlights } />
		</div>
	);
}
