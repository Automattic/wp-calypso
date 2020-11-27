/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { ActionButtons, Title, SubTitle } from '@automattic/onboarding';
import { __, sprintf } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { TextControl, SVG, Path, Tooltip, Circle, Rect } from '@wordpress/components';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import DomainPicker from '@automattic/domain-picker';
import { Icon, check } from '@wordpress/icons';
import { Link } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import FocusedLaunchSummaryItem, {
	LeadingContentSide,
	TrailingContentSide,
} from './focused-launch-summary-item';
/**
 * Internal dependencies
 */
import { Route } from '../route';
import {
	useTitle,
	useDomainSearch,
	useSiteDomains,
	useDomainSelection,
	useSite,
	usePlans,
} from '../../hooks';

import { LAUNCH_STORE, Plan } from '../../stores';
import LaunchContext from '../../context';
import { isDefaultSiteTitle } from '../../utils';
import { FOCUSED_LAUNCH_FLOW_ID } from '../../constants';

import './style.scss';

const bulb = (
	<SVG viewBox="0 0 24 24">
		<Path d="M12 15.8c-3.7 0-6.8-3-6.8-6.8s3-6.8 6.8-6.8c3.7 0 6.8 3 6.8 6.8s-3.1 6.8-6.8 6.8zm0-12C9.1 3.8 6.8 6.1 6.8 9s2.4 5.2 5.2 5.2c2.9 0 5.2-2.4 5.2-5.2S14.9 3.8 12 3.8zM8 17.5h8V19H8zM10 20.5h4V22h-4z" />
	</SVG>
);

const info = (
	<SVG className="focused-launch-summary__info-icon" viewBox="0 0 24 24" width="16">
		<Circle cx="12" cy="12" stroke="#8C8F94" strokeWidth="2" r="10" fill="transparent" />
		<Rect x="10.5" y="5" width="3" height="3" fill="#8C8F94" />
		<Rect x="10.5" y="10" width="3" height="8" fill="#8C8F94" />
	</SVG>
);

type SummaryStepProps = {
	input: ReactNode;
	commentary?: ReactNode;
};

const SummaryStep: React.FunctionComponent< SummaryStepProps > = ( { input, commentary } ) => (
	<div className="focused-launch-summary__step">
		<div className="focused-launch-summary__data-input">
			<div className="focused-launch-summary__section">{ input }</div>
		</div>
		<div className="focused-launch-summary__side-commentary">{ commentary }</div>
	</div>
);

type CommonStepProps = {
	stepIndex?: number;
};

// Props in common between all summary steps + a few props from <TextControl>
type SiteTitleStepProps = CommonStepProps &
	Pick< React.ComponentProps< typeof TextControl >, 'value' | 'onChange' | 'onBlur' >;

const SiteTitleStep: React.FunctionComponent< SiteTitleStepProps > = ( {
	stepIndex,
	value,
	onChange,
	onBlur,
} ) => {
	return (
		<SummaryStep
			input={
				<TextControl
					className="focused-launch-summary__input"
					label={
						<label className="focused-launch-summary__label">
							{ stepIndex && `${ stepIndex }. ` }
							{ __( 'Name your site', __i18n_text_domain__ ) }
						</label>
					}
					value={ value }
					onChange={ onChange }
					onBlur={ onBlur }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={ true }
				/>
			}
		/>
	);
};

// Props in common between all summary steps + a few props from <DomainPicker> +
// the remaining extra props
type DomainStepProps = CommonStepProps & { hasPaidDomain?: boolean; isLoading: boolean } & Pick<
		React.ComponentProps< typeof DomainPicker >,
		| 'existingSubdomain'
		| 'currentDomain'
		| 'initialDomainSearch'
		| 'onDomainSelect'
		| 'onExistingSubdomainSelect'
		| 'locale'
	>;

const DomainStep: React.FunctionComponent< DomainStepProps > = ( {
	stepIndex,
	existingSubdomain,
	currentDomain,
	initialDomainSearch,
	hasPaidDomain,
	onDomainSelect,
	onExistingSubdomainSelect,
	locale,
	isLoading,
} ) => {
	return (
		<SummaryStep
			input={
				hasPaidDomain ? (
					<>
						<label className="focused-launch-summary__label">
							{ __( 'Your domain', __i18n_text_domain__ ) }
							<Tooltip
								position="top center"
								text={ __(
									'Changes to your purchased domain can be managed from your Domains page.',
									__i18n_text_domain__
								) }
							>
								<span>{ info }</span>
							</Tooltip>
							<p className="focused-launch-summary__mobile-commentary">
								<Icon icon={ bulb } />
								<span>
									{ createInterpolateElement(
										__(
											'<strong>Unique domains</strong> help build brand trust',
											__i18n_text_domain__
										),
										{
											strong: <strong />,
										}
									) }
								</span>
							</p>
						</label>
						<FocusedLaunchSummaryItem readOnly>
							<LeadingContentSide label={ currentDomain || '' } />
							<TrailingContentSide nodeType="PRICE">
								<Icon icon={ check } size={ 18 } /> { __( 'Purchased', __i18n_text_domain__ ) }
							</TrailingContentSide>
						</FocusedLaunchSummaryItem>
					</>
				) : (
					<>
						<DomainPicker
							header={
								<>
									<label className="focused-launch-summary__label">
										{ stepIndex && `${ stepIndex }. ` }
										{ __( 'Confirm your domain', __i18n_text_domain__ ) }
									</label>
									<p className="focused-launch-summary__mobile-commentary">
										<Icon icon={ bulb } />
										<span>
											{ createInterpolateElement(
												__(
													'<strong>46.9%</strong> of registered domains are <strong>.com</strong>',
													__i18n_text_domain__
												),
												{
													strong: <strong />,
												}
											) }
										</span>
									</p>
								</>
							}
							areDependenciesLoading={ isLoading }
							existingSubdomain={ existingSubdomain }
							currentDomain={ currentDomain }
							onDomainSelect={ onDomainSelect }
							onExistingSubdomainSelect={ onExistingSubdomainSelect }
							initialDomainSearch={ initialDomainSearch }
							showSearchField={ false }
							analyticsFlowId={ FOCUSED_LAUNCH_FLOW_ID }
							analyticsUiAlgo="summary_domain_step"
							quantity={ 3 }
							quantityExpanded={ 3 }
							itemType="individual-item"
							locale={ locale }
						/>
						<Link to={ Route.DomainDetails } className="focused-launch-summary__details-link">
							{ __( 'View all domains', __i18n_text_domain__ ) }
						</Link>
					</>
				)
			}
			commentary={
				<>
					{ hasPaidDomain ? (
						<p className="focused-launch-summary__side-commentary-title">
							{ createInterpolateElement(
								__(
									'<strong>Unique domains</strong> help build brand recognition and trust',
									__i18n_text_domain__
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) : (
						<>
							<p className="focused-launch-summary__side-commentary-title">
								{ createInterpolateElement(
									__(
										'<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>',
										__i18n_text_domain__
									),
									{
										strong: <strong />,
									}
								) }
							</p>
							<ul className="focused-launch-summary__side-commentary-list">
								<li className="focused-launch-summary__side-commentary-list-item">
									<Icon icon={ check } />
									{ __( 'Stand out with a unique domain', __i18n_text_domain__ ) }
								</li>
								<li className="focused-launch-summary__side-commentary-list-item">
									<Icon icon={ check } />
									{ __( 'Easy to remember and easy to share', __i18n_text_domain__ ) }
								</li>
								<li className="focused-launch-summary__side-commentary-list-item">
									<Icon icon={ check } />
									{ __( 'Builds brand recognition and trust', __i18n_text_domain__ ) }
								</li>
							</ul>
						</>
					) }
				</>
			}
		/>
	);
};

type PlanStepProps = CommonStepProps & {
	hasPaidPlan?: boolean;
	hasPaidDomain?: boolean;
	selectedPaidDomain?: boolean;
};

const PlanStep: React.FunctionComponent< PlanStepProps > = ( {
	stepIndex,
	hasPaidPlan = false,
	hasPaidDomain = false,
	selectedPaidDomain = false,
} ) => {
	const { setPlan, unsetPlan } = useDispatch( LAUNCH_STORE );

	const selectedPlan = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedPlan() );

	const onceSelectedPaidPlan = useSelect( ( select ) => select( LAUNCH_STORE ).getPaidPlan() );

	const { defaultPaidPlan, defaultFreePlan, planPrices } = usePlans();

	const [ nonDefaultPaidPlan, setNonDefaultPaidPlan ] = useState< Plan | undefined >();

	const isPlanSelected = ( plan: Plan ) => plan && plan.storeSlug === selectedPlan?.storeSlug;

	const sitePlan = useSite().sitePlan;

	useEffect( () => {
		// To keep the launch store state valid,
		// unselect the free plan if the user selected a paid domain.
		// free plans don't support paid domains.
		if ( selectedPaidDomain && selectedPlan && selectedPlan.isFree ) {
			unsetPlan();
		}
	}, [ selectedPaidDomain, selectedPlan, unsetPlan ] );

	// if the user picks a non-default paid plan, we need to keep track of it
	// this allows us to keep showing it when they change their mind, we don't want
	// it to disappear once they pick the default paid plan
	useEffect( () => {
		if ( onceSelectedPaidPlan !== defaultPaidPlan ) {
			setNonDefaultPaidPlan( onceSelectedPaidPlan );
		}
	}, [ onceSelectedPaidPlan, defaultPaidPlan ] );

	return (
		<SummaryStep
			input={
				hasPaidPlan ? (
					<>
						<label className="focused-launch-summary__label">
							{ __( 'Your plan', __i18n_text_domain__ ) }
							<Tooltip
								position="top center"
								text={ __(
									'Changes to your purchased plan can be managed from your Plans page.',
									__i18n_text_domain__
								) }
							>
								<span>{ info }</span>
							</Tooltip>
							<p className="focused-launch-summary__mobile-commentary focused-launch-summary__mobile-only">
								<Icon icon={ bulb } />
								<span>
									{ createInterpolateElement(
										__(
											'More than <strong>38%</strong> of the internet uses <strong>WordPress</strong>',
											__i18n_text_domain__
										),
										{
											strong: <strong />,
										}
									) }
								</span>
							</p>
						</label>
						<div>
							<FocusedLaunchSummaryItem readOnly={ true }>
								<LeadingContentSide label={ sitePlan?.product_name_short_with_suffix } />
								<TrailingContentSide nodeType="PRICE">
									<Icon icon={ check } size={ 18 } /> { __( 'Purchased', __i18n_text_domain__ ) }
								</TrailingContentSide>
							</FocusedLaunchSummaryItem>
						</div>
					</>
				) : (
					<>
						<label className="focused-launch-summary__label">
							{ stepIndex && `${ stepIndex }. ` }
							{ __( 'Confirm your plan', __i18n_text_domain__ ) }
						</label>
						<p className="focused-launch-summary__mobile-commentary focused-launch-summary__mobile-only">
							<Icon icon={ bulb } />
							<span>
								{ createInterpolateElement(
									__(
										'Grow your business with <strong>WordPress Business</strong>',
										__i18n_text_domain__
									),
									{
										strong: <strong />,
									}
								) }
							</span>
						</p>
						<div>
							<FocusedLaunchSummaryItem
								isLoading={ ! defaultFreePlan || ! defaultPaidPlan }
								onClick={ () => defaultPaidPlan && setPlan( defaultPaidPlan ) }
								isSelected={ isPlanSelected( defaultPaidPlan ) }
							>
								<LeadingContentSide
									label={
										/* translators: %s is WordPress.com plan name (eg: Premium Plan) */
										sprintf( __( '%s Plan', __i18n_text_domain__ ), defaultPaidPlan?.title ?? '' )
									}
									badgeText={
										defaultPaidPlan?.isPopular ? __( 'Popular', __i18n_text_domain__ ) : ''
									}
								/>
								<TrailingContentSide nodeType="PRICE">
									<span>{ defaultPaidPlan && planPrices[ defaultPaidPlan?.storeSlug ] }</span>
									<span>
										{
											// translators: /mo is short for "per-month"
											__( '/mo', __i18n_text_domain__ )
										}
									</span>
								</TrailingContentSide>
							</FocusedLaunchSummaryItem>

							{ nonDefaultPaidPlan && (
								<FocusedLaunchSummaryItem
									isLoading={ ! defaultFreePlan || ! defaultPaidPlan }
									onClick={ () => nonDefaultPaidPlan && setPlan( nonDefaultPaidPlan ) }
									isSelected={ isPlanSelected( nonDefaultPaidPlan ) }
								>
									<LeadingContentSide
										label={
											/* translators: %s is WordPress.com plan name (eg: Premium Plan) */
											sprintf(
												__( '%s Plan', __i18n_text_domain__ ),
												nonDefaultPaidPlan?.title ?? ''
											)
										}
										badgeText={
											nonDefaultPaidPlan?.isPopular ? __( 'Popular', __i18n_text_domain__ ) : ''
										}
									/>
									<TrailingContentSide nodeType="PRICE">
										<span>
											{ nonDefaultPaidPlan && planPrices[ nonDefaultPaidPlan?.storeSlug ] }
										</span>
										<span>
											{
												// translators: /mo is short for "per-month"
												__( '/mo', __i18n_text_domain__ )
											}
										</span>
									</TrailingContentSide>
								</FocusedLaunchSummaryItem>
							) }

							<FocusedLaunchSummaryItem
								isLoading={ ! defaultFreePlan || ! defaultPaidPlan }
								readOnly={ hasPaidDomain || selectedPaidDomain }
								onClick={ () => defaultFreePlan && setPlan( defaultFreePlan ) }
								isSelected={ ! ( hasPaidDomain || selectedPaidDomain ) && selectedPlan?.isFree }
							>
								<LeadingContentSide
									label={
										/* translators: %s is WordPress.com plan name (eg: Premium Plan) */
										sprintf( __( '%s Plan', __i18n_text_domain__ ), defaultFreePlan?.title ?? '' )
									}
								/>
								<TrailingContentSide
									nodeType={ hasPaidDomain || selectedPaidDomain ? 'WARNING' : 'PRICE' }
								>
									{ hasPaidDomain || selectedPaidDomain
										? __( 'Not available with your domain selection', __i18n_text_domain__ )
										: __( 'Free', __i18n_text_domain__ ) }
								</TrailingContentSide>
							</FocusedLaunchSummaryItem>
						</div>
						<Link to={ Route.PlanDetails } className="focused-launch-summary__details-link">
							{ __( 'View all plans', __i18n_text_domain__ ) }
						</Link>
					</>
				)
			}
			commentary={
				hasPaidPlan ? (
					<p className="focused-launch-summary__side-commentary-title">
						{ createInterpolateElement(
							__(
								'More than <strong>38%</strong> of the internet uses <strong>WordPress</strong>',
								__i18n_text_domain__
							),
							{
								strong: <strong />,
							}
						) }
					</p>
				) : (
					<>
						<p className="focused-launch-summary__side-commentary-title">
							{ createInterpolateElement(
								__(
									'Monetize your site with <strong>WordPress Premium</strong>',
									__i18n_text_domain__
								),
								{
									strong: <strong />,
								}
							) }
						</p>
						<ul className="focused-launch-summary__side-commentary-list">
							<li className="focused-launch-summary__side-commentary-list-item">
								<Icon icon={ check } />
								{ __( 'Advanced tools and customization', __i18n_text_domain__ ) }
							</li>
							<li className="focused-launch-summary__side-commentary-list-item">
								<Icon icon={ check } />
								{ __( 'Unlimited premium themes', __i18n_text_domain__ ) }
							</li>
							<li className="focused-launch-summary__side-commentary-list-item">
								<Icon icon={ check } />
								{ __( 'Accept payments', __i18n_text_domain__ ) }
							</li>
						</ul>
					</>
				)
			}
		/>
	);
};

type StepIndexRenderFunction = ( renderOptions: {
	stepIndex: number;
	forwardStepIndex: boolean;
} ) => ReactNode;

const Summary: React.FunctionComponent = () => {
	const { title, updateTitle, saveTitle, isSiteTitleStepVisible, showSiteTitleStep } = useTitle();

	const { sitePrimaryDomain, siteSubdomain, hasPaidDomain } = useSiteDomains();
	const { onDomainSelect, onExistingSubdomainSelect } = useDomainSelection();
	const selectedDomain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const { domainSearch, isLoading } = useDomainSearch();

	const site = useSite();

	const { locale, redirectTo } = useContext( LaunchContext );

	const { setModalDismissible, showModalTitle } = useDispatch( LAUNCH_STORE );

	// When the summary view is active, the modal should be dismissible, and
	// the modal title should be visible
	useEffect( () => {
		setModalDismissible();
		showModalTitle();
	}, [ setModalDismissible, showModalTitle ] );

	// If the user needs to change the site title, always show the site title
	// step to the user when in this launch flow.
	useEffect( () => {
		if ( ! isSiteTitleStepVisible && isDefaultSiteTitle( { currentSiteTitle: title } ) ) {
			showSiteTitleStep();
		}
	}, [ title, showSiteTitleStep, isSiteTitleStepVisible ] );

	const hasPaidPlan = site.isPaidPlan;

	const onAskForHelpClick = ( event: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => {
		const helpHref = ( event.target as HTMLAnchorElement ).getAttribute( 'href' );

		if ( ! helpHref ) {
			return;
		}

		redirectTo( helpHref );
		event.preventDefault();
	};

	// Prepare Steps
	const renderSiteTitleStep: StepIndexRenderFunction = ( { stepIndex, forwardStepIndex } ) => (
		<SiteTitleStep
			stepIndex={ forwardStepIndex ? stepIndex : undefined }
			key={ stepIndex }
			value={ title || '' }
			onChange={ updateTitle }
			onBlur={ saveTitle }
		/>
	);

	const renderDomainStep: StepIndexRenderFunction = ( { stepIndex, forwardStepIndex } ) => (
		<DomainStep
			stepIndex={ forwardStepIndex ? stepIndex : undefined }
			key={ stepIndex }
			existingSubdomain={ siteSubdomain?.domain }
			currentDomain={ selectedDomain?.domain_name ?? sitePrimaryDomain?.domain }
			initialDomainSearch={ domainSearch }
			hasPaidDomain={ hasPaidDomain }
			isLoading={ isLoading }
			onDomainSelect={ onDomainSelect }
			/** NOTE: this makes the assumption that the user has a free domain,
			 * thus when they click the free domain, we just remove the value from the store
			 * this is a valid strategy in this context because they won't even see this step if
			 * they already have a paid domain
			 * */
			onExistingSubdomainSelect={ onExistingSubdomainSelect }
			locale={ locale }
		/>
	);

	const renderPlanStep: StepIndexRenderFunction = ( { stepIndex, forwardStepIndex } ) => (
		<PlanStep
			hasPaidPlan={ hasPaidPlan }
			selectedPaidDomain={ selectedDomain && ! selectedDomain.is_free }
			hasPaidDomain={ hasPaidDomain }
			stepIndex={ forwardStepIndex ? stepIndex : undefined }
			key={ stepIndex }
		/>
	);

	// Disabled steps are not interactive (e.g. user has already selected domain/plan)
	// Active steps require user interaction
	// Using this arrays allows to easily sort the steps correctly in both
	// groups, and allows the actve steps to always show the correct step index.
	const disabledSteps: StepIndexRenderFunction[] = [];
	const activeSteps: StepIndexRenderFunction[] = [];
	isSiteTitleStepVisible && activeSteps.push( renderSiteTitleStep );
	( hasPaidDomain ? disabledSteps : activeSteps ).push( renderDomainStep );
	( hasPaidPlan ? disabledSteps : activeSteps ).push( renderPlanStep );

	return (
		<div className="focused-launch-container">
			<div className="focused-launch-summary__section">
				<Title tagName="h2">
					{ hasPaidDomain && hasPaidPlan
						? __( "You're ready to launch", __i18n_text_domain__ )
						: __( "You're almost there", __i18n_text_domain__ ) }
				</Title>
				<SubTitle tagName="p" className="focused-launch-summary__caption">
					{ hasPaidDomain && hasPaidPlan
						? __(
								"You're good to go! Launch your site and share your site address.",
								__i18n_text_domain__
						  )
						: __(
								'Prepare for launch! Confirm a few final things before you take it live.',
								__i18n_text_domain__
						  ) }
				</SubTitle>
			</div>
			{ disabledSteps.map( ( disabledStepRenderer, disabledStepIndex ) =>
				// Disabled steps don't show the step index
				disabledStepRenderer( { stepIndex: disabledStepIndex + 1, forwardStepIndex: false } )
			) }
			{ activeSteps.map( ( activeStepRenderer, activeStepIndex ) =>
				// Active steps show the step index only if there are at least 2 steps
				activeStepRenderer( {
					stepIndex: activeStepIndex + 1,
					forwardStepIndex: activeSteps.length > 1,
				} )
			) }

			<div className="focused-launch-summary__actions-wrapper">
				<ActionButtons className="focused-launch-summary__launch-action-bar">
					{ /* @TODO: placeholder for https://github.com/Automattic/wp-calypso/issues/47392 */ }
					<Link to={ Route.Success }>{ __( 'Launch your site', __i18n_text_domain__ ) }</Link>
				</ActionButtons>

				<div className="focused-launch-summary__ask-for-help">
					<p>{ __( 'Questions? Our experts can assist.', __i18n_text_domain__ ) }</p>
					<a href="/help" onClick={ onAskForHelpClick }>
						{ __( 'Ask a Happiness Engineer', __i18n_text_domain__ ) }
					</a>
				</div>
			</div>
		</div>
	);
};

export default Summary;
