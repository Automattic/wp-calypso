import { getPlan, PLAN_BUSINESS, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { useSelector } from 'calypso/state';

interface Props {
	site: SiteDetails;
}
const TrialPlan = function TrialPlan( props: Props ) {
	const { __ } = useI18n();
	const { site } = props;
	const targetSiteEligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, site?.ID )
	);
	const planType = targetSiteEligibleForProPlan ? PLAN_WPCOM_PRO : PLAN_BUSINESS;
	const plan = getPlan( planType );

	return (
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
						a: createElement( 'a', { href: '#' } ),
					}
				) }
			</p>

			<NextButton>{ __( 'Start the trial and migrate' ) }</NextButton>
		</div>
	);
};

export default TrialPlan;
