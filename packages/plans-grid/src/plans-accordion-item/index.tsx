/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';
import { NextButton } from '@automattic/onboarding';
import type { DomainSuggestions, Plans } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PlansFeatureList from '../plans-feature-list';
import { PLANS_STORE } from '../stores';

/**
 * Style dependencies
 */
import './style.scss';

const ChevronDown = (
	<svg width="8" viewBox="0 0 8 4">
		<path d="M0 0 L8 0 L4 4 L0 0" fill="currentColor" />
	</svg>
);

const SPACE_BAR_KEYCODE = 32;

export interface Props {
	slug: Plans.PlanSlug;
	name: string;
	description: string;
	features: Plans.PlanSimplifiedFeature[];
	billingPeriod: Plans.PlanBillingPeriod;
	domain?: DomainSuggestions.DomainSuggestion;
	badge?: string;
	isFree?: boolean;
	isOpen?: boolean;
	isPrimary?: boolean;
	isSelected?: boolean;
	onSelect: ( productId: number | undefined ) => void;
	onPickDomainClick?: () => void;
	onToggle?: ( slug: Plans.PlanSlug, isOpen: boolean ) => void;
	disabledLabel?: string;
}

const PlanAccordionItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	description,
	features,
	billingPeriod,
	domain,
	badge,
	isFree = false,
	isOpen = false,
	isPrimary = false,
	onSelect,
	onPickDomainClick,
	onToggle,
	disabledLabel,
} ) => {
	const { __ } = useI18n();

	const planProduct = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanProduct( slug, billingPeriod )
	);

	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0\u00A0';

	const handleToggle = () => {
		! disabledLabel && onToggle?.( slug, ! isOpen );
	};

	const planItemPriceLabelAnnually = __( 'billed annually', __i18n_text_domain__ );
	const planItemPriceLabelMonthly = __( 'per month, billed monthly', __i18n_text_domain__ );

	return (
		<div
			className={ classNames( 'plans-accordion-item', {
				'is-open': isOpen,
				'is-primary': isPrimary,
				'has-badge': !! badge,
				'is-disabled': !! disabledLabel,
			} ) }
		>
			{ badge && (
				<div className="plans-accordion-item__badge">
					<span>{ badge }</span>
				</div>
			) }
			<div className="plans-accordion-item__viewport">
				<div className="plans-accordion-item__details">
					<div
						tabIndex={ 0 }
						role="button"
						onClick={ handleToggle }
						onKeyDown={ ( e ) => e.keyCode === SPACE_BAR_KEYCODE && handleToggle() }
						className="plans-accordion-item__header"
					>
						<div className="plans-accordion-item__heading">
							<div className="plans-accordion-item__name">{ name }</div>
							<div className="plans-accordion-item__description">{ description }</div>
						</div>
						<div className="plans-accordion-item__price">
							<div
								className={ classNames( 'plans-accordion-item__price-amount', {
									'is-loading': ! planProduct?.price,
								} ) }
							>
								{ planProduct?.price || nbsp }
								{ planProduct?.price && (
									<span>
										{
											// translators: /mo is short for "per-month"
											__( '/mo', __i18n_text_domain__ )
										}
									</span>
								) }
							</div>
							<div className="plans-accordion-item__price-note">
								{ isFree && __( 'free forever', __i18n_text_domain__ ) }

								{ ! isFree &&
									( billingPeriod === 'ANNUALLY'
										? planItemPriceLabelAnnually
										: planItemPriceLabelMonthly ) }
							</div>
							{ ! isFree && (
								<div
									className={ classNames( 'plans-accordion-item__price-discount', {
										'plans-accordion-item__price-discount--disabled': billingPeriod !== 'ANNUALLY',
									} ) }
								>
									{ sprintf(
										// Translators: will be like "Save up to 30% by paying annually". Please keep "%%" for the percent sign
										__( `Save %(discountRate)s%% by paying annually`, __i18n_text_domain__ ),
										{ discountRate: planProduct?.annualDiscount ?? 0 }
									) }
								</div>
							) }
						</div>
						<div className="plans-accordion-item__disabled-label">{ disabledLabel }</div>
						{ ! isOpen && (
							<div className="plans-accordion-item__dropdown-chevron">{ ChevronDown }</div>
						) }
					</div>
					<div
						className={ classNames( 'plans-accordion-item__actions', {
							'plans-accordion-item__actions--paid-plan-margin': ! isFree,
						} ) }
						hidden={ ! isOpen }
					>
						<NextButton
							data-e2e-button={ isFree ? 'freePlan' : 'paidPlan' }
							onClick={ () => {
								onSelect( planProduct?.productId );
							} }
						>
							{ __( 'Select', __i18n_text_domain__ ) }
						</NextButton>
					</div>
					<PlansFeatureList
						features={ features }
						billingPeriod={ billingPeriod }
						domain={ domain }
						isFree={ isFree }
						isOpen={ isOpen }
						onPickDomain={ onPickDomainClick }
						multiColumn
					/>
				</div>
			</div>
		</div>
	);
};

export default PlanAccordionItem;
