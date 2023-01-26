import { isWooExpressFlow, StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';

import './styles.scss';

export enum AssignTrialResult {
	SUCCESS = 'success',
	FAILURE = 'failure',
}

const AssignTrialPlanStep: Step = function AssignTrialPlanStep( { navigation, data, flow } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const progress = useSelect( ( select ) => select( ONBOARD_STORE ).getProgress() );
	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );
	const { setProgress } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		setProgress( 0.4 );
		if ( submit ) {
			const assignTrialPlan = async () => {
				try {
					if ( ! data?.siteSlug ) {
						throw new Error( 'Invalid site slug' );
					}

					await wpcom.req.post(
						`/sites/${ data?.siteSlug }/ecommerce-trial/add/ecommerce-trial-bundle-monthly`,
						{
							apiVersion: '1.1',
						}
					);

					submit?.( { siteSlug: data?.siteSlug }, AssignTrialResult.SUCCESS );
				} catch ( err: any ) {
					submit?.( { siteSlug: data?.siteSlug }, AssignTrialResult.FAILURE );
				}
			};

			assignTrialPlan();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const getCurrentMessage = () => {
		return __( "Woo! We're creating your store" );
	};

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="assign-trial-step"
				isHorizontalLayout={ true }
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<div className="assign-trial-step">
							<h1 className="assign-trial-step__progress-step">{ getCurrentMessage() }</h1>
							{ progress >= 0 || isWooExpressFlow( flow ) ? (
								<LoadingBar progress={ progress } />
							) : (
								<LoadingEllipsis />
							) }
						</div>
					</>
				}
				stepProgress={ stepProgress }
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default AssignTrialPlanStep;
