import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { StepperLoader } from 'calypso/landing/stepper/declarative-flow/internals/components';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { AssignTrialResult } from './constants';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './styles.scss';

const AssignTrialPlanStep: Step = function AssignTrialPlanStep( { navigation, data } ) {
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
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<StepperLoader
						title={ getCurrentMessage() }
						subtitle={ getSubTitle() }
						progress={ progress }
					/>
				}
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default AssignTrialPlanStep;
