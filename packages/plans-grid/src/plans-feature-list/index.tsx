/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { createInterpolateElement } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { Icon, check, close } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import '../types-patch';

/**
 * Style dependencies
 */
import './style.scss';

const TickIcon = <Icon icon={ check } size={ 17 } />;
const CrossIcon = <Icon icon={ close } size={ 17 } />;
const ChevronDown = (
	<svg width="8" viewBox="0 0 8 4">
		<path d="M0 0 L8 0 L4 4 L0 0" fill="currentColor" />
	</svg>
);

function domainMessageStateMachine(
	isFreePlan: boolean,
	domain: DomainSuggestions.DomainSuggestion | undefined,
	__: typeof import('@wordpress/i18n').__
) {
	const states = {
		NO_DOMAIN: {
			FREE_PLAN: null,
			PAID_PLAN: {
				className: 'plans-feature-list__domain-summary is-cta',
				icon: TickIcon,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: (
					<>
						{ __( 'Pick a free domain (1 year)', __i18n_text_domain__ ) } { ChevronDown }
					</>
				),
			},
		},
		FREE_DOMAIN: {
			FREE_PLAN: null,
			PAID_PLAN: {
				className: 'plans-feature-list__domain-summary is-cta',
				icon: TickIcon,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: (
					<>
						{ __( 'Pick a free domain (1 year)', __i18n_text_domain__ ) } { ChevronDown }
					</>
				),
			},
		},
		PAID_DOMAIN: {
			FREE_PLAN: {
				className: 'plans-feature-list__domain-summary is-free',
				icon: CrossIcon,
				// translators: <url /> is a domain name eg: example.com is not included
				domainMessage: (
					<span>
						{ createInterpolateElement( __( '<url /> is not included', __i18n_text_domain__ ), {
							url: <span className="plans-feature-list__item-url">{ domain?.domain_name }</span>,
						} ) }
					</span>
				),
			},
			PAID_PLAN: {
				className: 'plans-feature-list__domain-summary is-picked',
				icon: TickIcon,
				// translators: <url /> is a domain name eg: example.com is included
				domainMessage: (
					<span>
						{ createInterpolateElement( __( '<url /> is included', __i18n_text_domain__ ), {
							url: <span className="plans-feature-list__item-url">{ domain?.domain_name }</span>,
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
	features: Array< string >;
	domain?: DomainSuggestions.DomainSuggestion;
	isFree?: boolean;
	isOpen?: boolean;
	onPickDomain?: () => void;
	disabledLabel?: string;
	multiColumn?: boolean;
}

const PlansFeatureList: React.FunctionComponent< Props > = ( {
	features,
	domain,
	isFree = false,
	isOpen = false,
	onPickDomain,
	disabledLabel,
	multiColumn = false,
} ) => {
	const domainMessage = domainMessageStateMachine( isFree, domain, __ );

	return (
		<div className="plans-feature-list" hidden={ ! isOpen }>
			<ul
				className={ classnames( 'plans-feature-list__item-group', {
					'plans-feature-list__item-group--columns': multiColumn,
				} ) }
			>
				{ disabledLabel ? (
					<li className="plans-feature-list__item plans-feature-list__item--disabled-message">
						{ CrossIcon } <span>{ disabledLabel }</span>
					</li>
				) : (
					domainMessage && (
						<li className="plans-feature-list__item">
							<Button className={ domainMessage.className } onClick={ onPickDomain } isLink>
								{ domainMessage.icon }
								{ domainMessage.domainMessage }
							</Button>
						</li>
					)
				) }
				{ features.map( ( feature, i ) => (
					<li key={ i } className="plans-feature-list__item">
						{ TickIcon } <span>{ feature }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default PlansFeatureList;
