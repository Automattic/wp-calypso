/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';
import { createInterpolateElement } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { Icon, check, close } from '@wordpress/icons';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';

// TODO: remove when all needed core types are available
/*#__PURE__*/ import '../types-patch';

const TickIcon = <Icon icon={ check } size={ 17 } />;
const CrossIcon = <Icon icon={ close } size={ 17 } />;
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

function domainMessageStateMachine(
	isFreePlan: boolean,
	domain: DomainSuggestions.DomainSuggestion | undefined,
	__: Function
) {
	const states = {
		NO_DOMAIN: {
			FREE_PLAN: null,
			PAID_PLAN: {
				className: 'plan-item__domain-summary is-cta',
				icon: TickIcon,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: (
					<>
						{ __( 'Pick a free domain (1 year)' ) } { ChevronDown }
					</>
				),
			},
		},
		FREE_DOMAIN: {
			FREE_PLAN: null,
			PAID_PLAN: {
				className: 'plan-item__domain-summary is-cta',
				icon: TickIcon,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: (
					<>
						{ __( 'Pick a free domain (1 year)' ) } { ChevronDown }
					</>
				),
			},
		},
		PAID_DOMAIN: {
			FREE_PLAN: {
				className: 'plan-item__domain-summary is-free',
				icon: CrossIcon,
				// translators: <url /> is a domain name eg: example.com is not included
				domainMessage: (
					<span>
						{ createInterpolateElement( __( '<url /> is not included' ), {
							url: <span className="plan-item__url">{ domain?.domain_name }</span>,
						} ) }
					</span>
				),
			},
			PAID_PLAN: {
				className: 'plan-item__domain-summary is-picked',
				icon: TickIcon,
				// translators: <url /> is a domain name eg: example.com is included
				domainMessage: (
					<span>
						{ createInterpolateElement( __( '<url /> is included' ), {
							url: <span className="plan-item__url">{ domain?.domain_name }</span>,
						} ) }
					</span>
				),
			},
		},
	};
	const domainKey = domain && ( domain.is_free ? 'FREE_DOMAIN' : 'PAID_DOMAIN' );
	const planKey = isFreePlan ? 'FREE_PLAN' : 'PAID_PLAN';

	return states[ domainKey || 'NO_DOMAIN' ][ planKey ];
}

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

	const domainMessage = domainMessageStateMachine( isFree, domain, __ );

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
						<div className="plan-item__features">
							<ul className="plan-item__feature-item-group">
								<li className="plan-item__feature-item">
									{ disabledLabel ? (
										<span className="plan-item__disabled-message">
											{ CrossIcon }
											{ disabledLabel }
										</span>
									) : (
										domainMessage && (
											<Button
												className={ domainMessage.className }
												onClick={ onPickDomainClick }
												isLink
											>
												{ domainMessage.icon }
												{ domainMessage.domainMessage }
											</Button>
										)
									) }
								</li>
								{ features.map( ( feature, i ) => (
									<li key={ i } className="plan-item__feature-item">
										{ TickIcon } { feature }
									</li>
								) ) }
							</ul>
						</div>
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
