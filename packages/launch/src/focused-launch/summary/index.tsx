/* eslint-disable wpcalypso/jsx-classname-namespace */

import DomainPicker, {
	mockDomainSuggestion,
	SUGGESTION_ITEM_TYPE_INDIVIDUAL,
} from '@automattic/domain-picker';
import { useLocalizeUrl, useLocale } from '@automattic/i18n-utils';
import { ActionButtons, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { TextControl, SVG, Path, Tooltip, Circle, Rect, Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { FOCUSED_LAUNCH_FLOW_ID } from '../../constants';
import LaunchContext from '../../context';
import {
	useTitle,
	useDomainSearch,
	useSiteDomains,
	useDomainSelection,
	useSite,
	usePlans,
	useCart,
} from '../../hooks';
import { LAUNCH_STORE, SITE_STORE, PLANS_STORE } from '../../stores';
import { Route } from '../route';
import FocusedLaunchSummaryItem, {
	LeadingContentSide,
	TrailingContentSide,
} from './focused-launch-summary-item';
import type { Plan, PlanProduct } from '../../stores';

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
	input: React.ReactNode;
	commentary?: React.ReactNode;
	highlighted: boolean;
};

const SummaryStep: React.FunctionComponent< SummaryStepProps > = ( {
	input,
	commentary,
	highlighted,
} ) => (
	<div className={ classNames( 'focused-launch-summary__step', { highlighted } ) }>
		<div className="focused-launch-summary__data-input">
			<div className="focused-launch-summary__section">{ input }</div>
		</div>
		<div className="focused-launch-summary__side-commentary">{ commentary }</div>
	</div>
);

type CommonStepProps = {
	stepIndex?: number;
	highlighted?: boolean;
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
			highlighted
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
	>;

const DomainStep: React.FunctionComponent< DomainStepProps > = ( {
	stepIndex,
	existingSubdomain,
	currentDomain,
	initialDomainSearch,
	hasPaidDomain,
	onDomainSelect,
	onExistingSubdomainSelect,
	isLoading,
	highlighted,
} ) => {
	const locale = useLocale();

	return (
		<SummaryStep
			highlighted={ !! highlighted }
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
							<LeadingContentSide label={ currentDomain?.domain_name || '' } />
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
							itemType={ SUGGESTION_ITEM_TYPE_INDIVIDUAL }
							locale={ locale }
							orderSubDomainsLast={ true }
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
	highlighted,
	hasPaidPlan = false,
	hasPaidDomain = false,
	selectedPaidDomain = false,
} ) => {
	const locale = useLocale();

	const { setPlanProductId } = useDispatch( LAUNCH_STORE );

	const [ selectedPlanProductId, billingPeriod ] = useSelect( ( select ) => [
		select( LAUNCH_STORE ).getSelectedPlanProductId(),
		select( LAUNCH_STORE ).getLastPlanBillingPeriod(),
	] );

	const { selectedPlan, selectedPlanProduct } = useSelect( ( select ) => {
		const plansStore = select( PLANS_STORE );

		return {
			selectedPlan: plansStore.getPlanByProductId( selectedPlanProductId, locale ),
			selectedPlanProduct: plansStore.getPlanProductById( selectedPlanProductId ),
		};
	} );

	// persist non-default selected paid plan if it's paid in order to keep displaying it in the plan picker
	const [ nonDefaultPaidPlan, setNonDefaultPaidPlan ] = React.useState< Plan | undefined >();
	const [ nonDefaultPaidPlanProduct, setNonDefaultPaidPlanProduct ] = React.useState<
		PlanProduct | undefined
	>();

	const {
		defaultPaidPlan,
		defaultFreePlan,
		defaultPaidPlanProduct,
		defaultFreePlanProduct,
	} = usePlans( billingPeriod );

	React.useEffect( () => {
		if (
			selectedPlan &&
			defaultPaidPlan &&
			! selectedPlan.isFree &&
			selectedPlan.periodAgnosticSlug !== defaultPaidPlan.periodAgnosticSlug
		) {
			setNonDefaultPaidPlan( selectedPlan );
			setNonDefaultPaidPlanProduct( selectedPlanProduct );
		}
	}, [ selectedPlan, defaultPaidPlan, nonDefaultPaidPlan, selectedPlanProduct ] );

	const isPlanSelected = ( plan: Plan ) =>
		plan && plan.periodAgnosticSlug === selectedPlan?.periodAgnosticSlug;

	const { sitePlan } = useSite();

	const allAvailablePlans: ( Plan | undefined )[] = nonDefaultPaidPlan
		? [ defaultPaidPlan, nonDefaultPaidPlan, defaultFreePlan ]
		: [ defaultPaidPlan, defaultFreePlan ];

	const allAvailablePlansProducts: ( PlanProduct | undefined )[] = nonDefaultPaidPlanProduct
		? [ defaultPaidPlanProduct, nonDefaultPaidPlanProduct, defaultFreePlanProduct ]
		: [ defaultPaidPlanProduct, defaultFreePlanProduct ];

	const popularLabel = __( 'Popular', __i18n_text_domain__ );

	const freePlanLabel = __( 'Free', __i18n_text_domain__ );
	const freePlanLabelNotAvailable = __(
		'Not available with your domain selection',
		__i18n_text_domain__
	);

	return (
		<SummaryStep
			highlighted={ !! highlighted }
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
								<LeadingContentSide
									label={ sprintf(
										/* translators: Purchased plan label where %s is the WordPress.com plan name (eg: Personal, Premium, Business) */
										__( '%s Plan', __i18n_text_domain__ ),
										sitePlan?.product_name_short
									) }
								/>
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
							{ allAvailablePlans.map( ( plan, index ) => {
								const planProduct = allAvailablePlansProducts[ index ];
								if (
									! plan ||
									! planProduct ||
									plan.periodAgnosticSlug !== planProduct?.periodAgnosticSlug
								) {
									return <FocusedLaunchSummaryItem key={ index } isLoading />;
								}
								return (
									<FocusedLaunchSummaryItem
										key={ plan.periodAgnosticSlug }
										isLoading={ ! defaultFreePlan || ! defaultPaidPlan }
										onClick={ () =>
											setPlanProductId( allAvailablePlansProducts[ index ]?.productId )
										}
										isSelected={ isPlanSelected( plan ) }
										readOnly={ plan.isFree && ( hasPaidDomain || selectedPaidDomain ) }
									>
										<LeadingContentSide
											label={ sprintf(
												/* translators: %s is WordPress.com plan name (eg: Premium Plan) */
												__( '%s Plan', __i18n_text_domain__ ),
												plan.title ?? ''
											) }
											badgeText={ plan.isPopular ? popularLabel : '' }
										/>
										{ plan.isFree ? (
											<TrailingContentSide
												nodeType={ hasPaidDomain || selectedPaidDomain ? 'WARNING' : 'PRICE' }
											>
												{ hasPaidDomain || selectedPaidDomain
													? freePlanLabelNotAvailable
													: freePlanLabel }
											</TrailingContentSide>
										) : (
											<TrailingContentSide nodeType="PRICE">
												<span>{ allAvailablePlansProducts[ index ]?.price }</span>
												<span>
													{
														// translators: /mo is short for "per-month"
														__( '/mo', __i18n_text_domain__ )
													}
												</span>
											</TrailingContentSide>
										) }
									</FocusedLaunchSummaryItem>
								);
							} ) }
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
} ) => React.ReactNode;

const Summary: React.FunctionComponent = () => {
	const { siteId } = React.useContext( LaunchContext );

	const [
		hasSelectedDomain,
		isSiteTitleStepVisible,
		selectedDomain,
		selectedPlanProductId,
	] = useSelect( ( select ) => {
		const launchStore = select( LAUNCH_STORE );
		const { isSiteTitleStepVisible, domain, planProductId } = launchStore.getState();

		return [
			launchStore.hasSelectedDomainOrSubdomain(),
			isSiteTitleStepVisible,
			domain,
			planProductId,
		];
	}, [] );

	const isSelectedPlanPaid = useSelect(
		( select ) => select( LAUNCH_STORE ).isSelectedPlanPaid(),
		[]
	);

	const { launchSite } = useDispatch( SITE_STORE );
	const {
		setModalDismissible,
		unsetModalDismissible,
		showModalTitle,
		showSiteTitleStep,
	} = useDispatch( LAUNCH_STORE );

	const { title, isValidTitle, isDefaultTitle, updateTitle } = useTitle();
	const { siteSubdomain, hasPaidDomain } = useSiteDomains();
	const { onDomainSelect, onExistingSubdomainSelect, currentDomain } = useDomainSelection();
	const { domainSearch, isLoading } = useDomainSearch();
	const { hasPaidPlan } = useSite();

	const locale = useLocale();
	const localizeUrl = useLocalizeUrl();

	const { goToCheckoutAndLaunch, isCartUpdating } = useCart();

	// When the summary view is active, if cart is not updating, the modal should be dismissible, and
	// the modal title should be visible
	React.useEffect( () => {
		if ( isCartUpdating ) {
			unsetModalDismissible();
		} else {
			setModalDismissible();
		}

		showModalTitle();
	}, [ isCartUpdating, setModalDismissible, showModalTitle, unsetModalDismissible ] );

	// If the user needs to change the site title, always show the site title
	// step to the user when in this launch flow.
	// Allow changing site title when it's the default value or when it's an empty string.
	React.useEffect( () => {
		if ( ! isSiteTitleStepVisible && isDefaultTitle ) {
			showSiteTitleStep();
		}
	}, [ isDefaultTitle, showSiteTitleStep, isSiteTitleStepVisible, title ] );

	// Launch the site directly if Free plan and subdomain are selected.
	// Otherwise, show checkout as the next step.
	const handleLaunch = () => {
		// checking for not having a selected paid plan instead of checking for a selected Free plan because
		// user may be entering the launch flow after they have paid for a plan.
		if ( ! selectedDomain && ! isSelectedPlanPaid ) {
			launchSite( siteId );
		} else {
			goToCheckoutAndLaunch();
		}
	};

	// Prepare Steps
	const renderSiteTitleStep: StepIndexRenderFunction = ( { stepIndex, forwardStepIndex } ) => (
		<SiteTitleStep
			stepIndex={ forwardStepIndex ? stepIndex : undefined }
			key={ stepIndex }
			value={ title || '' }
			onChange={ updateTitle }
		/>
	);

	const isDomainStepHighlighted = !! selectedPlanProductId || !! hasSelectedDomain || isValidTitle;

	const renderDomainStep: StepIndexRenderFunction = ( { stepIndex, forwardStepIndex } ) => (
		<DomainStep
			highlighted={ isDomainStepHighlighted }
			stepIndex={ forwardStepIndex ? stepIndex : undefined }
			key={ stepIndex }
			existingSubdomain={ mockDomainSuggestion( siteSubdomain?.domain ) }
			currentDomain={ currentDomain }
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
		/>
	);

	const isPlansStepHighlighted = !! hasSelectedDomain || !! selectedPlanProductId;

	const renderPlanStep: StepIndexRenderFunction = ( { stepIndex, forwardStepIndex } ) => (
		<PlanStep
			highlighted={ isPlansStepHighlighted }
			hasPaidPlan={ hasPaidPlan }
			selectedPaidDomain={ selectedDomain && ! selectedDomain.is_free } // @TODO: check if selectedDomain can ever be free
			hasPaidDomain={ hasPaidDomain }
			stepIndex={ forwardStepIndex ? stepIndex : undefined }
			key={ stepIndex }
		/>
	);

	// Disabled steps are not interactive (e.g. user has already selected domain/plan)
	// Active steps require user interaction
	// Using this arrays allows to easily sort the steps correctly in both
	// groups, and allows the active steps to always show the correct step index.
	const disabledSteps: StepIndexRenderFunction[] = [];
	const activeSteps: StepIndexRenderFunction[] = [];
	isSiteTitleStepVisible && activeSteps.push( renderSiteTitleStep );
	( hasPaidDomain ? disabledSteps : activeSteps ).push( renderDomainStep );
	( hasPaidPlan ? disabledSteps : activeSteps ).push( renderPlanStep );

	/*
	 * Enable the launch button if:
	 * - the site title input is not empty
	 * - there is a purchased or selected domain
	 * - there is a purchased or selected plan
	 */
	const isReadyToLaunch =
		title && ( hasPaidDomain || hasSelectedDomain ) && ( hasPaidPlan || selectedPlanProductId );

	const titleReady = __( "You're ready to launch", __i18n_text_domain__ );
	const titleInProgress = __( "You're almost there", __i18n_text_domain__ );

	const subtitleReady = __(
		"You're good to go! Launch your site and share your site address.",
		__i18n_text_domain__
	);
	const subtitleInProgress = __(
		'Prepare for launch! Confirm a few final things before you take it live.',
		__i18n_text_domain__
	);

	return (
		<div className="focused-launch-container">
			<div className="focused-launch-summary__section">
				<Title tagName="h2">{ hasPaidDomain && hasPaidPlan ? titleReady : titleInProgress }</Title>
				<SubTitle tagName="p" className="focused-launch-summary__caption">
					{ hasPaidDomain && hasPaidPlan ? subtitleReady : subtitleInProgress }
				</SubTitle>
			</div>
			{ disabledSteps.map( ( disabledStepRenderer, disabledStepIndex ) =>
				// Disabled steps don't show the step index
				disabledStepRenderer( {
					stepIndex: disabledStepIndex + 1,
					forwardStepIndex: false,
				} )
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
					<NextButton
						className={ classNames( 'focused-launch-summary__launch-button', {
							'focused-launch-summary__launch-button--is-loading': isCartUpdating,
						} ) }
						disabled={ ! isReadyToLaunch || isCartUpdating }
						onClick={ handleLaunch }
					>
						{ __( 'Launch your site', __i18n_text_domain__ ) }
					</NextButton>
				</ActionButtons>

				<div className="focused-launch-summary__ask-for-help">
					<p>{ __( 'Questions? Our experts can assist.', __i18n_text_domain__ ) }</p>
					<Button
						isLink
						href={ localizeUrl( 'https://wordpress.com/help/contact', locale ) }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Ask a Happiness Engineer', __i18n_text_domain__ ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Summary;
