import { isWooExpressFlow, StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { AssignTrialResult } from './constants';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './styles.scss';

const AssignTrialPlanStep: Step = function AssignTrialPlanStep( { navigation, data, flow } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const progress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProgress(),
		[]
	);
	const profilerData =
		useSelect( ( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProfilerData(), [] ) ||
		{};

	useEffect( () => {
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
						},
						{
							wpcom_woocommerce_onboarding: profilerData,
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

	const getSubTitle = () => {
		return (
			<>
				<strong>{ __( '#FunWooFact: ' ) }</strong>
				{ __(
					'Did you know that Woo powers almost 4 million stores worldwide? You’re in good company.'
				) }
			</>
		);
	};

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="assign-trial-step"
				isHorizontalLayout
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
							{ isWooExpressFlow( flow ) ? (
								<p className="processing-step__subtitle">{ getSubTitle() }</p>
							) : (
								<></>
							) }
						</div>
					</>
				}
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default AssignTrialPlanStep;
