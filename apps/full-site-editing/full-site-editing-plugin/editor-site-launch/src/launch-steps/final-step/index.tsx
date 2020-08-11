/**
 * External dependencies
 */
import * as React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Tip } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useEntityProp } from '@wordpress/core-data';
import { Title, SubTitle } from '@automattic/onboarding';
import {
	CheckoutStepBody,
	checkoutTheme,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	MainContentUI,
	CheckoutStepAreaUI,
	SubmitButtonWrapperUI,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { LaunchStep } from '../../../../common/data-stores/launch/data';
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import { LAUNCH_STORE, PLANS_STORE } from '../../stores';
import { useSite } from '../../hooks';

import './styles.scss';

const TickIcon = <Icon icon={ check } size={ 17 } />;

const FinalStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const [ title ] = useEntityProp( 'root', 'site', 'title' );
	const { currentDomainName } = useSite();
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const plan = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedPlan() );
	const { completedSteps } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { setStep } = useDispatch( LAUNCH_STORE );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );

	const nameSummary = (
		<div className="nux-launch__summary-item">
			<p>
				{ __( 'Site', 'full-site-editing' ) }: { title }
			</p>
		</div>
	);

	const domainSummary = (
		<div className="nux-launch__summary-item">
			{ domain?.domain_name ? (
				<p>
					{ __( 'Custom domain', 'full-site-editing' ) }: { domain.domain_name }
				</p>
			) : (
				<>
					<p>
						{ __( 'Free site address', 'full-site-editing' ) }: { currentDomainName }
					</p>
					<Tip>
						{ __(
							'A custom site address like madefreshbakery.com (now available!) is more unique and can help with your SEO ranking.',
							'full-site-editing'
						) }
					</Tip>
				</>
			) }
		</div>
	);

	const planSummary = (
		<div className="nux-launch__summary-item">
			{ plan && ! plan?.isFree ? (
				<>
					<p className="nux-launch__summary-item__plan-name">WordPress.com { plan.title }</p>
					{ __( 'Plan subscription', 'full-site-editing' ) }: { prices[ plan.storeSlug ] }{ ' ' }
					{ __( 'per month, billed yearly', 'full-site-editing' ) }
				</>
			) : (
				<>
					<p className="nux-launch__summary-item__plan-name">WordPress.com Free</p>
					<p>{ __( 'Plan subscription: Free forever', 'full-site-editing' ) }</p>
					<Tip>
						{ __(
							'Upgrade to Premium to get access to 13GB storage space, payment collection options, 24/7 Live Chat support, and more. Not sure? Give it a spin—we offer 30-day full-refunds, guaranteed.',
							'full-site-editing'
						) }
					</Tip>
				</>
			) }
		</div>
	);

	return (
		<LaunchStepContainer className="nux-launch-final-step">
			<div className="nux-launch-step__header">
				<div>
					<Title>{ __( 'Launch your site', 'full-site-editing' ) }</Title>
					<SubTitle>
						{ __(
							'Your site will be made public and ready to share with others.',
							'full-site-editing'
						) }
					</SubTitle>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<ThemeProvider theme={ checkoutTheme }>
					<MainContentUI>
						{ completedSteps.includes( LaunchStep.Plan ) && (
							<CheckoutSummaryArea>
								<CheckoutSummaryCard className="nux-launch__feature-list">
									<h3 className="nux-launch__feature-list-title">
										{ __( 'Included in your plan', 'full-site-editing' ) }
									</h3>
									<ul className="nux-launch__feature-item-group">
										{ plan?.features.map( ( feature, i ) => (
											<li key={ i } className="nux-launch__feature-item">
												{ TickIcon } { feature }
											</li>
										) ) }
									</ul>
									<p>
										{ __( 'Questions?', 'full-site-editing' ) }{ ' ' }
										<Button isLink href="https://wordpress.com/help/contact" target="_blank">
											{ __( 'Ask a Happiness Engineer', 'full-site-editing' ) }
										</Button>
									</p>
								</CheckoutSummaryCard>
							</CheckoutSummaryArea>
						) }
						<CheckoutStepAreaUI>
							<CheckoutStepBody
								titleContent={ __( 'Your site name', 'full-site-editing' ) }
								isStepComplete={ completedSteps.includes( LaunchStep.Name ) }
								goToThisStep={ () => setStep( LaunchStep.Name ) }
								completeStepContent={ nameSummary }
								stepId="name"
								formStatus="ready"
							/>
							<CheckoutStepBody
								titleContent={ __( 'Your domain', 'full-site-editing' ) }
								isStepComplete={ completedSteps.includes( LaunchStep.Domain ) }
								goToThisStep={ () => setStep( LaunchStep.Domain ) }
								completeStepContent={ domainSummary }
								stepId="domain"
								formStatus="ready"
							/>
							<CheckoutStepBody
								titleContent={ __( 'Your plan', 'full-site-editing' ) }
								isStepComplete={ completedSteps.includes( LaunchStep.Plan ) }
								goToThisStep={ () => setStep( LaunchStep.Plan ) }
								completeStepContent={ planSummary }
								stepId="plan"
								formStatus="ready"
							/>
							<SubmitButtonWrapperUI>
								<Button
									isPrimary
									disabled={ completedSteps.length < 3 }
									onClick={ onNextStep }
									className="nux-launch__submit-button"
								>
									{ __( 'Launch your site', 'full-site-editing' ) }
								</Button>
							</SubmitButtonWrapperUI>
						</CheckoutStepAreaUI>
					</MainContentUI>
				</ThemeProvider>
			</div>
		</LaunchStepContainer>
	);
};

export default FinalStep;
