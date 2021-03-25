/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { Icon, check } from '@wordpress/icons';

import type { DomainSuggestions, Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import PlansFeatureList from '../plans-feature-list';
import { PLANS_STORE } from '../stores';

import type { CTAVariation, PopularBadgeVariation } from './types';

// TODO: remove when all needed core types are available
/*#__PURE__*/ import '../types-patch';

const TickIcon = <Icon icon={ check } size={ 17 } />;

const ChevronDown = (
	<svg width="8" viewBox="0 0 8 4">
		<path d="M0 0 L8 0 L4 4 L0 0" fill="currentColor" />
	</svg>
);

const SPACE_BAR_KEYCODE = 32;

/**
 * There are 6 possible cases of the domain message (the combinations of [hasDomain, isFreeDomain, isFreePlan]
 * Ifs and elses grew unclear. This is a simple state machine that covers all the states. To maintain it,
 * please look for the state you need (e.g: free_domain => paid_plan) and edit that branch.
 *
 * @param isFreePlan boolean determining whether the plan is free
 * @param domain the domain (can be undefined => NO_DOMAIN)
 * @param __ translate function
 */

export interface Props {
	slug: string;
	name: string;
	tagline?: string | false;
	features: Plans.PlanSimplifiedFeature[];
	billingPeriod: Plans.PlanBillingPeriod;
	domain?: DomainSuggestions.DomainSuggestion;
	isPopular?: boolean;
	isFree?: boolean;
	isSelected?: boolean;
	onSelect: ( planProductId: number | undefined ) => void;
	onPickDomainClick?: () => void;
	onToggleExpandAll?: () => void;
	allPlansExpanded: boolean;
	disabledLabel?: string;
	CTAVariation?: CTAVariation;
	popularBadgeVariation?: PopularBadgeVariation;
}

// NOTE: there is some duplicate markup between this plan item (used in the
// 'table' version of the plans grid) and the accordion plan item (used in the
// 'accordion' version of the plans grid). Ideally the code should be refactored
// to use the same markup, with just different styles

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	tagline,
	isPopular = false,
	isFree = false,
	domain,
	features,
	billingPeriod,
	onSelect,
	onPickDomainClick,
	onToggleExpandAll,
	allPlansExpanded,
	disabledLabel,
	CTAVariation = 'NORMAL',
	popularBadgeVariation = 'ON_TOP',
	isSelected,
} ) => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();

	const planProduct = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanProduct( slug, billingPeriod )
	);

	const [ isOpenInternalState, setIsOpenInternalState ] = React.useState( false );

	const isDesktop = useViewportMatch( 'mobile', '>=' );

	// show a nbsp in price while loading to prevent a jump in the UI
	const nbsp = '\u00A0';

	React.useEffect( () => {
		setIsOpenInternalState( allPlansExpanded );
	}, [ allPlansExpanded ] );

	const isOpen = allPlansExpanded || isDesktop || isPopular || isOpenInternalState;

	const normalCtaLabelFallback = __( 'Choose', __i18n_text_domain__ );
	const fullWidthCtaLabelSelected = __( 'Current Selection', __i18n_text_domain__ );
	// translators: %s is a WordPress.com plan name (eg: Free, Personal)
	const fullWidthCtaLabelUnselected = __( 'Select %s', __i18n_text_domain__ );

	const fallbackPlanItemPriceLabelAnnually = __( 'billed annually', __i18n_text_domain__ );
	// translators: %s is the cost per year (e.g "billed as 96$ annually")
	const newPlanItemPriceLabelAnnually = __(
		'per month, billed as %s annually',
		__i18n_text_domain__
	);
	const planItemPriceLabelAnnually =
		locale === 'en' || hasTranslation?.( 'per month, billed as %s annually' )
			? sprintf( newPlanItemPriceLabelAnnually, planProduct?.annualPrice )
			: fallbackPlanItemPriceLabelAnnually;

	const planItemPriceLabelMonthly = __( 'per month, billed monthly', __i18n_text_domain__ );

	const expandToggleLabelExpanded = __( 'Collapse all plans', __i18n_text_domain__ );
	const expandToggleLabelCollapsed = __( 'Expand all plans', __i18n_text_domain__ );

	return (
		<div
			className={ classNames( 'plan-item', {
				'is-popular': isPopular,
				'is-open': isOpen,
				'badge-next-to-name': popularBadgeVariation === 'NEXT_TO_NAME',
			} ) }
		>
			{ isPopular && popularBadgeVariation === 'ON_TOP' && (
				<span className="plan-item__badge">{ __( 'Popular', __i18n_text_domain__ ) }</span>
			) }
			<div className={ classNames( 'plan-item__viewport', { 'is-popular': isPopular } ) }>
				<div className="plan-item__details">
					<div
						tabIndex={ 0 }
						role="button"
						onClick={ () => setIsOpenInternalState( ( open ) => ! open ) }
						onKeyDown={ ( e ) =>
							e.keyCode === SPACE_BAR_KEYCODE && setIsOpenInternalState( ( open ) => ! open )
						}
						className="plan-item__summary"
					>
						<div
							className={ classNames( 'plan-item__heading', {
								'badge-next-to-name': popularBadgeVariation === 'NEXT_TO_NAME',
							} ) }
						>
							<div className="plan-item__name">{ name }</div>
							{ isPopular && popularBadgeVariation === 'NEXT_TO_NAME' && (
								<span className="plan-item__badge-next-to-name">
									{ __( 'Popular', __i18n_text_domain__ ) }
								</span>
							) }
						</div>
						{ tagline && <p className="plan-item__tagline">{ tagline }</p> }
						<div className="plan-item__price">
							<div
								className={ classNames( 'plan-item__price-amount', {
									'is-loading': ! planProduct?.price,
								} ) }
							>
								{ planProduct?.price || nbsp }
							</div>
						</div>
						{ ! isOpen && <div className="plan-item__dropdown-chevron">{ ChevronDown }</div> }
					</div>
					<div hidden={ ! isOpen }>
						<div className="plan-item__price-note">
							{ isFree && __( 'free forever', __i18n_text_domain__ ) }
							{ ! isFree &&
								( billingPeriod === 'ANNUALLY'
									? planItemPriceLabelAnnually
									: planItemPriceLabelMonthly ) }
						</div>

						{ /*
							For the free plan, the following div is still rendered invisible
							and ignored by screen readers (via aria-hidden) to ensure the same
							vertical spacing as the rest of the plan cards
						 */ }
						<div
							className={ classNames( 'plan-item__price-discount', {
								'plan-item__price-discount--disabled': billingPeriod !== 'ANNUALLY',
								'plan-item__price-discount--hidden': isFree,
							} ) }
							aria-hidden={ isFree ? 'true' : 'false' }
						>
							{ sprintf(
								// Translators: will be like "Save 30% by paying annually".  Make sure the % symbol is kept.
								__( `Save %(discountRate)s%% by paying annually`, __i18n_text_domain__ ),
								{ discountRate: planProduct?.annualDiscount ?? 0 }
							) }
						</div>

						<div className="plan-item__actions">
							{ CTAVariation === 'NORMAL' ? (
								<Button
									className={ classNames(
										'plan-item__select-button',
										// TODO: Clean this up
										planProduct
											? `is-${ planProduct.periodAgnosticSlug }--${
													planProduct.billingPeriod === 'ANNUALLY' ? 'annual' : 'monthly'
											  }-plan`
											: ''
									) }
									onClick={ () => {
										onSelect( planProduct?.productId );
									} }
									isPrimary
									disabled={ !! disabledLabel }
								>
									<span>{ disabledLabel ?? normalCtaLabelFallback }</span>
								</Button>
							) : (
								<Button
									className={ classNames(
										'plan-item__select-button full-width',
										{
											'is-selected': isSelected,
											'is-popular': isPopular,
										}, // TODO: Clean this up
										planProduct
											? `is-${ planProduct.periodAgnosticSlug }--${
													planProduct.billingPeriod === 'ANNUALLY' ? 'annual' : 'monthly'
											  }-plan`
											: ''
									) }
									onClick={ () => {
										onSelect( planProduct?.productId );
									} }
									isPrimary={ isPopular }
									disabled={ !! disabledLabel }
								>
									<span>
										{ disabledLabel ?? (
											<>
												{ isSelected ? TickIcon : '' }
												{ isSelected
													? fullWidthCtaLabelSelected
													: sprintf( fullWidthCtaLabelUnselected, name ) }
											</>
										) }
									</span>
								</Button>
							) }
						</div>
						<PlansFeatureList
							features={ features }
							domain={ domain }
							isFree={ isFree }
							isOpen={ isOpen }
							onPickDomain={ onPickDomainClick }
							disabledLabel={
								disabledLabel &&
								sprintf(
									// Translators: %s is the domain name (e.g. "example.com is not included")
									__( '%s is not included', __i18n_text_domain__ ),
									domain?.domain_name
								)
							}
							billingPeriod={ billingPeriod }
						/>
					</div>
				</div>
			</div>

			{ isPopular && ! isDesktop && (
				<Button onClick={ onToggleExpandAll } className="plan-item__mobile-expand-all-plans" isLink>
					{ allPlansExpanded ? expandToggleLabelExpanded : expandToggleLabelCollapsed }
				</Button>
			) }
		</div>
	);
};

export default PlanItem;
