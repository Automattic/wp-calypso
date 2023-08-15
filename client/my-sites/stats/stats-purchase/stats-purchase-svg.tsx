import { useTranslate } from 'i18n-calypso';
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

	return (
		<>
			<svg width="456" height="383">
				<use href={ `${ statsPurchaseGraphSVG }#stats` } />
				{ isFree && <use href={ `${ statsPurchaseGraphSVG }#free-diff` } /> }
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
