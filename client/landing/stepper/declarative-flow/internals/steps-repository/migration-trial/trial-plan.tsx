import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React, { useState } from 'react';
import useUnsupportedTrialFeatureList from './hooks/use-unsupported-trial-feature-list';
import TrialPlanFeaturesModal from './trial-plan-features-modal';

const TrialPlan = function TrialPlan() {
	const { __ } = useI18n();
	const [ showPlanFeaturesModal, setShowPlanFeaturesModal ] = useState( false );

	const unsupportedTrialFeatureList = useUnsupportedTrialFeatureList();
	const plan = getPlan( PLAN_BUSINESS );

	return (
		<>
			{ showPlanFeaturesModal && (
				<TrialPlanFeaturesModal
					plan={ plan }
					onClose={ () => {
						setShowPlanFeaturesModal( false );
					} }
				/>
			) }

			<div className="trial-plan--container">
				<Title>{ __( 'Try before you buy' ) }</Title>
				<SubTitle>
					{ sprintf(
						/* translators: the planName could be "Pro" or "Business" */
						__( 'Try the %(planName)s plan free for 7 days and migrate your site for free' ),
						{ planName: plan?.getTitle() }
					) }
				</SubTitle>

				<p>
					{ createInterpolateElement(
						sprintf(
							/* translators: the planName could be "Pro" or "Business" */
							__(
								'The 7-day trial includes <a>every feature in the %(planName)s plan</a> with a few exceptions. To enjoy all the features without limits, upgrade to the paid plan at any time before your trial ends.'
							),
							{ planName: plan?.getTitle() }
						),
						{
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/pricing/' ) }
									onClick={ ( e: React.MouseEvent< HTMLElement > ) => {
										e.preventDefault();
										setShowPlanFeaturesModal( true );
									} }
								/>
							),
						}
					) }
				</p>

				<div className="trial-plan--details">
					<div className="trial-plan--details-name">
						<h3 className="plan-title">{ __( 'Trial' ) }</h3>
						<h4 className="plan-duration">{ __( '7 days' ) }</h4>
					</div>
					<div className="trial-plan--details-features">
						<ul>
							{ unsupportedTrialFeatureList.map( ( feature, i ) => (
								<li key={ i }>{ feature }</li>
							) ) }
						</ul>
					</div>
				</div>

				<NextButton>{ __( 'Start the trial and migrate' ) }</NextButton>
			</div>
		</>
	);
};

export default TrialPlan;
