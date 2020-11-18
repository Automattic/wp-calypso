/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import type { DomainSuggestions } from '@automattic/data-stores';
import type { CTAVariation, PopularBadgeVariation } from './types';

/**
 * Internal dependencies
 */
import PlansFeatureList from '../plans-feature-list';

// TODO: remove when all needed core types are available
/*#__PURE__*/ import '../types-patch';

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
	price: string;
	tagline?: string | false;
	features: Array< string >;
	domain?: DomainSuggestions.DomainSuggestion;
	isPopular?: boolean;
	isFree?: boolean;
	isSelected?: boolean;
	onSelect: ( slug: string ) => void;
	onPickDomainClick?: () => void;
	onToggleExpandAll?: () => void;
	allPlansExpanded: boolean;
	disabledLabel?: string;
	CTAVariation?: CTAVariation;
	popularBadgeVariation?: PopularBadgeVariation;
}

// NOTE: this component is used by PlansAccordion and contains some duplicated code from plans-table/plans-item.tsx
// TODO: keep only this component when it can support also being used in PlansTable

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	tagline,
	price,
	isPopular = false,
	isFree = false,
	domain,
	features,
	onSelect,
	onPickDomainClick,
	onToggleExpandAll,
	allPlansExpanded,
	disabledLabel,
	CTAVariation = 'NORMAL',
	popularBadgeVariation = 'ON_TOP',
} ) => {
	const [ isOpenInternalState, setIsOpenInternalState ] = React.useState( false );

	const isDesktop = useViewportMatch( 'mobile', '>=' );

	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0';

	React.useEffect( () => {
		setIsOpenInternalState( allPlansExpanded );
	}, [ allPlansExpanded ] );

	const isOpen = allPlansExpanded || isDesktop || isPopular || isOpenInternalState;

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
							<div className={ classNames( 'plan-item__price-amount', { 'is-loading': ! price } ) }>
								{ price || nbsp }
							</div>
						</div>
						{ ! isOpen && <div className="plan-item__dropdown-chevron">{ ChevronDown }</div> }
					</div>
					<div hidden={ ! isOpen }>
						<div className="plan-item__price-note">
							{ isFree
								? __( 'free forever', __i18n_text_domain__ )
								: __( 'per month, billed yearly', __i18n_text_domain__ ) }
						</div>

						<div className="plan-item__actions">
							{ CTAVariation === 'NORMAL' ? (
								<Button
									className="plan-item__select-button"
									onClick={ () => {
										onSelect( slug );
									} }
									isPrimary
									disabled={ !! disabledLabel }
								>
									<span>{ __( 'Choose', __i18n_text_domain__ ) }</span>
								</Button>
							) : (
								<Button
									className="plan-item__select-button full-width"
									onClick={ () => {
										onSelect( slug );
									} }
									isPrimary={ isPopular }
									disabled={ !! disabledLabel }
								>
									<span>
										{
											/* translators: %s is a WordPress.com plan name (eg: Free, Personal) */
											sprintf( __( 'Select %s', __i18n_text_domain__ ), name )
										}
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
							disabledLabel={ disabledLabel }
						/>
					</div>
				</div>
			</div>

			{ isPopular && ! isDesktop && (
				<Button onClick={ onToggleExpandAll } className="plan-item__mobile-expand-all-plans" isLink>
					{ allPlansExpanded
						? __( 'Collapse all plans', __i18n_text_domain__ )
						: __( 'Expand all plans', __i18n_text_domain__ ) }
				</Button>
			) }
		</div>
	);
};

export default PlanItem;
