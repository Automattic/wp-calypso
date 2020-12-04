/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { ThemeProvider } from 'emotion-theming';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Tip } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useSiteDomains, useDomainSuggestion, useDomainSearch, useTitle } from '@automattic/launch';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import {
	CheckoutStepBody,
	checkoutTheme,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	MainContentWrapper,
	CheckoutStepAreaWrapper,
	SubmitButtonWrapper,
	FormStatus,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import { LAUNCH_STORE, PLANS_STORE } from '../../stores';

import './styles.scss';

const TickIcon = <Icon icon={ check } size={ 17 } />;

const FinalStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep, onPrevStep } ) => {
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const plan = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedPlan() );
	const planPrices = useSelect( ( select ) =>
		select( PLANS_STORE ).getPrices( window.wpcomEditorSiteLaunch?.locale || 'en' )
	);
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );
	const isStepCompleted = useSelect( ( select ) => select( LAUNCH_STORE ).isStepCompleted );
	const isFlowCompleted = useSelect( ( select ) => select( LAUNCH_STORE ).isFlowCompleted() );

	const { title } = useTitle();
	const { siteSubdomain } = useSiteDomains();
	const domainSuggestion = useDomainSuggestion();
	const { domainSearch } = useDomainSearch();

	const { setStep } = useDispatch( LAUNCH_STORE );

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
						{ __( 'Free site address', 'full-site-editing' ) }: { siteSubdomain?.domain }
					</p>
					<Tip>
						{ domainSearch
							? createInterpolateElement(
									/* translators: <DomainName /> is the suggested custom domain name; <Link> will redirect users to domain selection step */
									__(
										'A custom site address like <DomainName /> (<Link>now available!</Link>) is more unique and can help with your SEO ranking.',
										'full-site-editing'
									),
									{
										DomainName: (
											<span
												className={ classnames( 'nux-launch__summary-item__domain-name', {
													'is-loading': ! domainSuggestion,
												} ) }
											>
												{ domainSuggestion?.domain_name || 'loading-example.com' }
											</span>
										),
										Link: <Button isLink onClick={ () => setStep( LaunchStep.Domain ) } />,
									}
							  )
							: __(
									'A custom site address is more unique and can help with your SEO ranking.',
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
					{ __( 'Plan subscription', 'full-site-editing' ) }: { planPrices[ plan.storeSlug ] }{ ' ' }
					{ __( 'per month, billed yearly', 'full-site-editing' ) }
				</>
			) : (
				<>
					<p className="nux-launch__summary-item__plan-name">WordPress.com Free</p>
					<p>{ __( 'Plan subscription: Free forever', 'full-site-editing' ) }</p>
					<Tip>
						{ createInterpolateElement(
							/* translators: pressing <Link> will redirect user to plan selection step */
							__(
								'<Link>Upgrade to Premium</Link> to get access to 13GB storage space, payment collection options, 24/7 Live Chat support, and more. Not sure? Give it a spin—we offer 30-day full-refunds, guaranteed.',
								'full-site-editing'
							),
							{
								Link: <Button isLink onClick={ () => setStep( LaunchStep.Plan ) } />,
							}
						) }
					</Tip>
				</>
			) }
		</div>
	);

	const handlePrev = () => {
		onPrevStep?.();
	};

	return (
		<LaunchStepContainer>
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
					<MainContentWrapper>
						{ isStepCompleted( LaunchStep.Plan ) && (
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
						<CheckoutStepAreaWrapper>
							<CheckoutStepBody
								isStepActive={ false }
								titleContent={ __( 'Your site name', 'full-site-editing' ) }
								isStepComplete={ isStepCompleted( LaunchStep.Name ) }
								goToThisStep={ () => setStep( LaunchStep.Name ) }
								completeStepContent={ nameSummary }
								stepId="name"
								formStatus={ FormStatus.READY }
							/>
							<CheckoutStepBody
								isStepActive={ false }
								titleContent={ __( 'Your domain', 'full-site-editing' ) }
								isStepComplete={ isStepCompleted( LaunchStep.Domain ) }
								goToThisStep={ () => setStep( LaunchStep.Domain ) }
								completeStepContent={ domainSummary }
								stepId="domain"
								formStatus={ FormStatus.READY }
							/>
							<CheckoutStepBody
								isStepActive={ false }
								titleContent={ __( 'Your plan', 'full-site-editing' ) }
								isStepComplete={ isStepCompleted( LaunchStep.Plan ) }
								goToThisStep={ () => setStep( LaunchStep.Plan ) }
								completeStepContent={ planSummary }
								stepId="plan"
								formStatus={ FormStatus.READY }
							/>
							<SubmitButtonWrapper>
								<Button
									isPrimary
									disabled={ ! isFlowCompleted }
									onClick={ onNextStep }
									className="nux-launch__submit-button"
								>
									{ __( 'Launch your site', 'full-site-editing' ) }
								</Button>
							</SubmitButtonWrapper>
						</CheckoutStepAreaWrapper>
					</MainContentWrapper>
				</ThemeProvider>
			</div>
			<div className="nux-launch-step__footer">
				<ActionButtons sticky={ true }>
					<BackButton onClick={ handlePrev } />
				</ActionButtons>
			</div>
		</LaunchStepContainer>
	);
};

export default FinalStep;
