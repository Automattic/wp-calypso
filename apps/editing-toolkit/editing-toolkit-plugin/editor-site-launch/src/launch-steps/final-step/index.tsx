/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { ThemeProvider } from 'emotion-theming';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Tip } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useSiteDomains, useDomainSuggestion, useDomainSearch, useTitle } from '@automattic/launch';
import { useLocale, useLocalizeUrl } from '@automattic/i18n-utils';
import { useI18n } from '@automattic/react-i18n';
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
	const { domain, LaunchStep, isStepCompleted, isFlowCompleted, planProductId } = useSelect(
		( select ) => {
			const launchStore = select( LAUNCH_STORE );
			return {
				domain: launchStore.getSelectedDomain(),
				LaunchStep: launchStore.getLaunchStep(),
				isStepCompleted: launchStore.isStepCompleted,
				isFlowCompleted: launchStore.isFlowCompleted(),
				planProductId: launchStore.getSelectedPlanProductId(),
			};
		}
	);

	const { __, hasTranslation } = useI18n();
	const locale = useLocale();

	const [ plan, planProduct ] = useSelect( ( select ) => [
		select( PLANS_STORE ).getPlanByProductId( planProductId, locale ),
		select( PLANS_STORE ).getPlanProductById( planProductId ),
	] );

	const { title } = useTitle();
	const { siteSubdomain } = useSiteDomains();
	const domainSuggestion = useDomainSuggestion();
	const { domainSearch } = useDomainSearch();

	const { setStep } = useDispatch( LAUNCH_STORE );

	const localizeUrl = useLocalizeUrl();

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
					{ planProduct?.billingPeriod === 'MONTHLY' && (
						<>
							<br />
							<span className="nux-launch__summary-item__domain-price">
								{ __( 'Domain Registration', 'full-site-editing' ) }:{ ' ' }
								{ sprintf(
									// translators: %s is the price with currency. Eg: $15/year
									__( '%s/year', 'full-site-editing' ),
									domain.cost
								) }
							</span>
						</>
					) }
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

	const fallbackPlanSummaryCostLabelAnnually = __( 'billed annually', 'full-site-editing' );
	// translators: %s is the cost per year (e.g "billed as 96$ annually")
	const newPlanSummaryCostLabelAnnually = __(
		'per month, billed as %s annually',
		'full-site-editing'
	);
	const planSummaryCostLabelAnnually =
		locale === 'en' || hasTranslation?.( 'per month, billed as %s annually' )
			? sprintf( newPlanSummaryCostLabelAnnually, planProduct?.annualPrice )
			: fallbackPlanSummaryCostLabelAnnually;

	const planSummaryCostLabelMonthly = __( 'per month, billed monthly', 'full-site-editing' );

	const planSummary = (
		<div className="nux-launch__summary-item">
			{ plan && planProduct && ! plan.isFree ? (
				<>
					<p className="nux-launch__summary-item__plan-name">WordPress.com { plan.title }</p>
					{ __( 'Plan subscription', 'full-site-editing' ) }: { planProduct.price }{ ' ' }
					{ planProduct.billingPeriod === 'ANNUALLY'
						? planSummaryCostLabelAnnually
						: planSummaryCostLabelMonthly }
				</>
			) : (
				<>
					<p className="nux-launch__summary-item__plan-name">WordPress.com Free</p>
					<p>{ __( 'Plan subscription: Free forever', 'full-site-editing' ) }</p>
					<Tip>
						{ createInterpolateElement(
							sprintf(
								/* translators: pressing <Link> will redirect user to plan selection step; %1$d is the number of days */
								__(
									'<Link>Upgrade to Premium</Link> to get access to 13GB storage space, payment collection options, 24/7 Live Chat support, and more. Not sure? Give it a spin—we offer %1$d-day full-refunds, guaranteed.',
									'full-site-editing'
								),
								14
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
										{ plan?.features
											// Some features are only available for the
											// annually-billed version of a plan
											.filter(
												( feature ) =>
													planProduct?.billingPeriod === 'ANNUALLY' ||
													! feature.requiresAnnuallyBilledPlan
											)
											.map( ( feature, i ) => (
												<li key={ i } className="nux-launch__feature-item">
													{ TickIcon } { feature.name }
												</li>
											) ) }
									</ul>
									<p>
										{ __( 'Questions?', 'full-site-editing' ) }{ ' ' }
										<Button
											isLink
											href={ localizeUrl( 'https://wordpress.com/help/contact', locale ) }
											target="_blank"
											rel="noopener noreferrer"
										>
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
