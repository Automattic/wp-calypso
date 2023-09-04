import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import calypsoStatsPurchaseGraphSVG from 'calypso/assets/images/stats/calypso-purchase-stats-graph.svg';
import statsPurchaseCelebrationSVG from 'calypso/assets/images/stats/purchase-stats-celebration.svg';
import statsPurchaseGraphSVG from 'calypso/assets/images/stats/purchase-stats-graph.svg';
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

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const purchaseGraphSVG = isOdysseyStats ? statsPurchaseGraphSVG : calypsoStatsPurchaseGraphSVG;

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
