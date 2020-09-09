/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';

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
}

// NOTE: this component is used by PlansAccordion and contains some duplicated code from plans-table/plans-item.tsx
// TODO: keep only this component when it can support also being used in PlansTable

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
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
} ) => {
	const { __ } = useI18n();

	const [ isOpenInternalState, setIsOpenInternalState ] = React.useState( false );

	const isDesktop = useViewportMatch( 'mobile', '>=' );

	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0';

	React.useEffect( () => {
		setIsOpenInternalState( allPlansExpanded );
	}, [ allPlansExpanded ] );

	const isOpen = allPlansExpanded || isDesktop || isPopular || isOpenInternalState;

	return (
		<div className={ classNames( 'plan-item', { 'is-popular': isPopular, 'is-open': isOpen } ) }>
			{ isPopular && <span className="plan-item__badge">{ __( 'Popular' ) }</span> }
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
						<div className="plan-item__heading">
							<div className="plan-item__name">{ name }</div>
						</div>
						<div className="plan-item__price">
							<div className={ classNames( 'plan-item__price-amount', { 'is-loading': ! price } ) }>
								{ price || nbsp }
							</div>
						</div>
						{ ! isOpen && <div className="plan-item__dropdown-chevron">{ ChevronDown }</div> }
					</div>
					<div hidden={ ! isOpen }>
						<div className="plan-item__price-note">
							{ isFree ? __( 'free forever' ) : __( 'per month, billed yearly' ) }
						</div>

						<div className="plan-item__actions">
							<Button
								className="plan-item__select-button"
								onClick={ () => {
									onSelect( slug );
								} }
								isPrimary
								disabled={ !! disabledLabel }
							>
								<span>{ __( 'Choose' ) }</span>
							</Button>
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
					{ allPlansExpanded ? __( 'Collapse all plans' ) : __( 'Expand all plans' ) }
				</Button>
			) }
		</div>
	);
};

export default PlanItem;
