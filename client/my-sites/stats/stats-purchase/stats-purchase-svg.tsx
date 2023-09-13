import { useTranslate } from 'i18n-calypso';
import calypsoStatsPurchaseGraphSVG from 'calypso/assets/images/stats/calypso-purchase-stats-graph.svg';
import statsPurchaseCelebrationSVG from 'calypso/assets/images/stats/purchase-stats-celebration.svg';
import statsPurchaseGraphSVG from 'calypso/assets/images/stats/purchase-stats-graph.svg';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

interface StatsPurchaseSVG {
	isFree: boolean | undefined;
	hasHighlight: boolean;
	extraMessage: boolean;
}

const StatsPurchaseSVG = ( {
	isFree,
	hasHighlight = false,
	extraMessage = false,
}: StatsPurchaseSVG ) => {
	const translate = useTranslate();
	const message = translate( 'Thanks for being one of our biggest supporters!' );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const purchaseGraphSVG = isWPCOMSite ? calypsoStatsPurchaseGraphSVG : statsPurchaseGraphSVG;

	return (
		<>
			<svg width="456" height="383">
				<use href={ `${ purchaseGraphSVG }#stats` } />
				{ isFree && <use href={ `${ purchaseGraphSVG }#free-diff` } /> }
			</svg>

			{ hasHighlight && (
				<>
					<div className={ `${ COMPONENT_CLASS_NAME }__celebrate` }>
						{ extraMessage && (
							<p className={ `${ COMPONENT_CLASS_NAME }__biggest-supporters` }>{ message }</p>
						) }
						<svg width="456" height="596" fill="none">
							<use href={ `${ statsPurchaseCelebrationSVG }#celeb` } />
						</svg>
					</div>
				</>
			) }
		</>
	);
};

export default StatsPurchaseSVG;
