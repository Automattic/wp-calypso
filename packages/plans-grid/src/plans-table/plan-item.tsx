/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { Icon, check, close, chevronDown } from '@wordpress/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import type { DomainSuggestions } from '@automattic/data-stores/dist/types';

const TickIcon = <Icon icon={ check } size={ 17 } />;
const CrossIcon = <Icon icon={ close } size={ 17 } />;
const ChevronDown = <Icon icon={ chevronDown } size={ 17 } />;

function domainMessageStateMachine(
	isFreePlan: boolean,
	__: Function,
	domain?: DomainSuggestions.DomainSuggestion
) {
	const states = {
		NO_DOMAIN: {
			FREE_PLAN: {
				className: 'plan-item__domain-summary is-free',
				icon: null,
				domainMessage: '',
			},
			PAID_PLAN: {
				className: 'plan-item__domain-summary is-cta',
				icon: ChevronDown,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: __( 'Pick a free domain (1 year)' ),
			},
		},
		FREE_DOMAIN: {
			FREE_PLAN: {
				className: 'plan-item__domain-summary is-free',
				icon: null,
				domainMessage: '',
			},
			PAID_PLAN: {
				className: 'plan-item__domain-summary is-cta',
				icon: ChevronDown,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: __( 'Pick a free domain (1 year)' ),
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
	price: string;
	features: Array< string >;
	domain?: DomainSuggestions.DomainSuggestion;
	isPopular?: boolean;
	isFree?: boolean;
	isSelected?: boolean;
	onSelect: ( slug: string ) => void;
	onPickDomainClick?: () => void;
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
} ) => {
	const { __ } = useI18n();

	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0';

	const domainMessage = domainMessageStateMachine( isFree, __, domain );

	return (
		<div className={ classNames( 'plan-item', { 'is-popular': isPopular } ) }>
			{ isPopular && <span className="plan-item__badge">{ __( 'Popular' ) }</span> }
			<div className={ classNames( 'plan-item__viewport', { 'is-popular': isPopular } ) }>
				<div className="plan-item__heading">
					<div className="plan-item__name">{ name }</div>
				</div>
				<div className="plan-item__price">
					<div className={ classNames( 'plan-item__price-amount', { 'is-loading': ! price } ) }>
						{ price || nbsp }
					</div>
					<div className="plan-item__price-note">
						{ isFree ? __( 'free forever' ) : __( 'per month, billed yearly' ) }
					</div>
				</div>
				<div className="plan-item__actions">
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
				<div className="plan-item__domain">
					{ domain && ! domain.is_free ? (
						<div className={ domainMessage.className }>
							{ domainMessage.icon }
							{ domainMessage.domainMessage }
						</div>
					) : (
						<Button isLink className={ domainMessage.className } onClick={ onPickDomainClick }>
							{ domainMessage.icon }
							{ domainMessage.domainMessage }
						</Button>
					) }
				</div>
				<div className="plan-item__features">
					<ul className="plan-item__feature-item-group">
						{ features.map( ( feature, i ) => (
							<li key={ i } className="plan-item__feature-item">
								{ TickIcon } { feature }
							</li>
						) ) }
					</ul>
				</div>
			</div>
		</div>
	);
};

export default PlanItem;
