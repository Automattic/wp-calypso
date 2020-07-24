/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { Icon, check, close } from '@wordpress/icons';
import classNames from 'classnames';
import '../types-patch';

/**
 * Internal dependencies
 */
import type { DomainSuggestions } from '@automattic/data-stores';

const TickIcon = <Icon icon={ check } size={ 17 } />;
const CrossIcon = <Icon icon={ close } size={ 17 } />;
const ChevronDown = (
	<svg width="8" viewBox="0 0 8 4">
		<path d="M0 0 L8 0 L4 4 L0 0" fill="currentColor" />
	</svg>
);

/**
 * Style dependencies
 */
import './style.scss';

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
			FREE_PLAN: {
				className: 'plan-item__domain-summary is-free',
				icon: CrossIcon,
				domainMessage: __( 'Custom domain not included' ),
			},
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
			FREE_PLAN: {
				className: 'plan-item__domain-summary is-free',
				icon: CrossIcon,
				domainMessage: __( 'Custom domain not included' ),
			},
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
				// translators: %s is a domain name eg: example.com is not included
				domainMessage: sprintf( __( '%s is not included' ), domain?.domain_name ),
			},
			PAID_PLAN: {
				className: 'plan-item__domain-summary is-picked',
				icon: TickIcon,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: sprintf( __( '%s is included' ), domain?.domain_name ),
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
	description: string;
	price: string;
	features: Array< string >;
	domain?: DomainSuggestions.DomainSuggestion;
	badge?: string;
	isFree?: boolean;
	isOpen?: boolean;
	isPrimary?: boolean;
	isSelected?: boolean;
	onSelect: ( slug: string ) => void;
	onPickDomainClick?: () => void;
	onToggle?: ( slug: string, isOpen: boolean ) => void;
}

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	description,
	price,
	features,
	domain,
	badge,
	isFree = false,
	isOpen = false,
	isPrimary = false,
	onSelect,
	onPickDomainClick,
	onToggle,
} ) => {
	const { __ } = useI18n();

	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0';

	const domainMessage = domainMessageStateMachine( isFree, domain, __ );

	const handleToggle = () => {
		onToggle?.( slug, ! isOpen );
	};

	return (
		<div
			className={ classNames( 'plan-item', {
				'is-open': isOpen,
				'is-primary': isPrimary,
				'has-badge': !! badge,
			} ) }
		>
			{ badge && (
				<div className="plan-item__badge">
					<span>{ badge }</span>
				</div>
			) }
			<div className="plan-item__viewport">
				<div className="plan-item__details">
					<div
						tabIndex={ 0 }
						role="button"
						onClick={ handleToggle }
						onKeyDown={ ( e ) => e.keyCode === SPACE_BAR_KEYCODE && handleToggle() }
						className="plan-item__header"
					>
						<div className="plan-item__heading">
							<div className="plan-item__name">{ name }</div>
							<div className="plan-item__description">{ description }</div>
						</div>
						<div className="plan-item__price">
							<div className={ classNames( 'plan-item__price-amount', { 'is-loading': ! price } ) }>
								{ price || nbsp }
								<span>{ __( '/mo' ) }</span>
							</div>
							<div className="plan-item__price-note">
								{ isFree ? __( 'free forever' ) : __( 'per month, billed annually' ) }
							</div>
						</div>
						{ ! isOpen && <div className="plan-item__dropdown-chevron">{ ChevronDown }</div> }
					</div>
					<div className="plan-item__actions" hidden={ ! isOpen }>
						<Button
							className="plan-item__select-button"
							onClick={ () => {
								onSelect( slug );
							} }
							isPrimary
							isLarge
						>
							<span>{ __( 'Select' ) }</span>
						</Button>
					</div>
					<div className="plan-item__features" hidden={ ! isOpen }>
						<ul className="plan-item__feature-item-group">
							<li className="plan-item__feature-item plan-item__domain">
								{ domainMessage && (
									<Button
										className={ domainMessage.className }
										onClick={ onPickDomainClick }
										isLink
									>
										{ domainMessage.icon }
										{ domainMessage.domainMessage }
									</Button>
								) }
							</li>
							{ features.map( ( feature, i ) => (
								<li key={ i } className="plan-item__feature-item">
									<span>
										{ TickIcon } { feature }
									</span>
								</li>
							) ) }
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlanItem;
