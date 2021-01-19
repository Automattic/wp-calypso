/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { createInterpolateElement } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { Icon, check, close } from '@wordpress/icons';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import '../types-patch';
import type { BillingIntervalType } from '../plans-interval-toggle';

/**
 * Style dependencies
 */
import './style.scss';

interface FeatureListItemContentWrapperProps {
	className: string;
}

interface FeatureListIconProps {
	className: string;
}

const TickIcon: React.FunctionComponent< FeatureListIconProps > = ( { className } ) => (
	// @TODO: Fix TypeScript error about className
	// @ts-ignore
	<Icon className={ className } icon={ check } size={ 18 } />
);
const CrossIcon: React.FunctionComponent< FeatureListIconProps > = ( { className } ) => (
	// @TODO: Fix TypeScript error about className
	// @ts-ignore
	<Icon className={ className } icon={ close } size={ 18 } />
);

const DefaultFeatureListItemContentWrapper: React.FunctionComponent< FeatureListItemContentWrapperProps > = ( {
	children,
	className,
} ) => <span className={ className }>{ children }</span>;

const FeatureAnnualDiscountNudge: React.FunctionComponent< {
	billingInterval: BillingIntervalType;
	__: typeof import('@wordpress/i18n').__;
} > = ( { billingInterval, __ } ) => (
	<span
		className="plans-feature-list__item-annual-nudge"
		aria-label={
			billingInterval === 'ANNUALLY'
				? __( 'Included with annual plans', __i18n_text_domain__ )
				: __( 'Only included with annual plans', __i18n_text_domain__ )
		}
	>
		{ __( 'Included with annual plans', __i18n_text_domain__ ) }
	</span>
);

function computeDomainFeatureItem(
	isFreePlan: boolean,
	domain: DomainSuggestions.DomainSuggestion | undefined,
	__: typeof import('@wordpress/i18n').__
) {
	const commonWrapperClassName = 'plans-feature-list__item-content-wrapper--domain-button';

	const states = {
		NO_DOMAIN: {
			FREE_PLAN: null,
			PAID_PLAN: {
				wrapperClassName: commonWrapperClassName,
				bulletIcon: TickIcon,
				// actionIcon: ChevronDown,
				requiresAnnuallyBilledPlan: true,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: <>{ __( 'Pick a free domain (1 year)', __i18n_text_domain__ ) }</>,
			},
		},
		FREE_DOMAIN: {
			FREE_PLAN: null,
			PAID_PLAN: {
				wrapperClassName: commonWrapperClassName,
				bulletIcon: TickIcon,
				// actionIcon: ChevronDown,
				requiresAnnuallyBilledPlan: true,
				// translators: %s is a domain name eg: example.com is included
				domainMessage: <>{ __( 'Pick a free domain (1 year)', __i18n_text_domain__ ) }</>,
			},
		},
		PAID_DOMAIN: {
			FREE_PLAN: {
				wrapperClassName: classnames( commonWrapperClassName, 'is-unavailable' ),
				bulletIcon: CrossIcon,
				// actionIcon: undefined,
				requiresAnnuallyBilledPlan: false,
				// translators: <url /> is a domain name eg: example.com is not included
				domainMessage: (
					<>
						{ createInterpolateElement( __( '<url /> is not included', __i18n_text_domain__ ), {
							url: <span className="plans-feature-list__item-url">{ domain?.domain_name }</span>,
						} ) }
					</>
				),
			},
			PAID_PLAN: {
				wrapperClassName: commonWrapperClassName,
				bulletIcon: TickIcon,
				// actionIcon: undefined,
				requiresAnnuallyBilledPlan: true,
				// translators: <url /> is a domain name eg: example.com is included
				domainMessage: (
					<>
						{ createInterpolateElement( __( '<url /> is included', __i18n_text_domain__ ), {
							url: <span className="plans-feature-list__item-url">{ domain?.domain_name }</span>,
						} ) }
					</>
				),
			},
		},
	};

	const domainKey = domain && ( domain.is_free ? 'FREE_DOMAIN' : 'PAID_DOMAIN' );
	const planKey = isFreePlan ? 'FREE_PLAN' : 'PAID_PLAN';

	return states[ domainKey || 'NO_DOMAIN' ][ planKey ];
}

type FeatureListItem = {
	bulletIcon: React.FunctionComponent< FeatureListIconProps >;
	textNode: React.ReactNode;
	requiresAnnuallyBilledPlan: boolean;
	contentWrapperNode?: React.FunctionComponent< FeatureListItemContentWrapperProps >;
	listItemExtraClassName?: string;
};

interface FeatureListItemProps extends FeatureListItem {
	billingInterval: BillingIntervalType;
}

const PlansFeatureListItem: React.FunctionComponent< FeatureListItemProps > = (
	{
		bulletIcon: BulletIcon,
		textNode,
		requiresAnnuallyBilledPlan,
		contentWrapperNode: ItemWrapper = DefaultFeatureListItemContentWrapper,
		listItemExtraClassName,
		billingInterval,
	},
	index
) => {
	const { __ } = useI18n();
	return (
		<li
			key={ index }
			className={ classnames(
				'plans-feature-list__item',
				{
					'plans-feature-list__item--requires-annual-enabled':
						requiresAnnuallyBilledPlan && billingInterval === 'ANNUALLY',
					'plans-feature-list__item--requires-annual-disabled':
						requiresAnnuallyBilledPlan && billingInterval !== 'ANNUALLY',
				},
				listItemExtraClassName
			) }
		>
			<ItemWrapper className="plans-feature-list__item-content-wrapper">
				<BulletIcon className="plans-feature-list__item-bullet-icon" />
				<span className="plans-feature-list__item-text">
					{ requiresAnnuallyBilledPlan && (
						<FeatureAnnualDiscountNudge billingInterval={ billingInterval } __={ __ } />
					) }
					<span className="plans-feature-list__item-description">{ textNode }</span>
				</span>
			</ItemWrapper>
		</li>
	);
};

export interface PlansFeatureListProps {
	features: Array< string >;
	billingInterval: BillingIntervalType;
	domain?: DomainSuggestions.DomainSuggestion;
	isFree?: boolean;
	isOpen?: boolean;
	onPickDomain?: () => void;
	disabledLabel?: string;
	multiColumn?: boolean;
}

const PlansFeatureList: React.FunctionComponent< PlansFeatureListProps > = ( {
	features,
	domain,
	billingInterval,
	isFree: isFreePlan = false,
	isOpen = false,
	onPickDomain,
	disabledLabel,
	multiColumn = false,
} ) => {
	const { __ } = useI18n();
	const domainFeatureItem = computeDomainFeatureItem( isFreePlan, domain, __ );

	const featureItems: FeatureListItem[] = [];

	// First feature item is about the availability of the domain
	if ( disabledLabel ) {
		featureItems.push( {
			bulletIcon: CrossIcon,
			textNode: { disabledLabel },
			requiresAnnuallyBilledPlan: false,
			listItemExtraClassName: 'plans-feature-list__item--disabled-message',
		} );
	} else if ( domainFeatureItem ) {
		featureItems.push( {
			bulletIcon: domainFeatureItem.bulletIcon,
			textNode: domainFeatureItem.domainMessage,
			requiresAnnuallyBilledPlan: domainFeatureItem.requiresAnnuallyBilledPlan,
			contentWrapperNode: ( { children, className } ) => (
				<Button
					className={ classnames( domainFeatureItem.wrapperClassName, className ) }
					onClick={ onPickDomain }
					isLink
				>
					{ children }
				</Button>
			),
		} );
	}

	// @TODO: move out to data-store
	// Remaining feature items are coming from the APIs
	const augmentedApiFeatures = features.map( ( feature, index ) => ( {
		feature,
		requiresAnnuallyBilledPlan: index === 2,
	} ) );
	augmentedApiFeatures.forEach( ( { feature, requiresAnnuallyBilledPlan } ) =>
		featureItems.push( {
			bulletIcon: TickIcon,
			textNode: <>{ feature }</>,
			requiresAnnuallyBilledPlan,
		} )
	);

	return (
		<div className="plans-feature-list" hidden={ ! isOpen }>
			<ul
				className={ classnames( 'plans-feature-list__item-group', {
					'plans-feature-list__item-group--columns': multiColumn,
				} ) }
			>
				{ featureItems.map( ( featureItemData, index ) => (
					<PlansFeatureListItem
						{ ...featureItemData }
						billingInterval={ billingInterval }
						key={ index }
					/>
				) ) }
			</ul>
		</div>
	);
};

export default PlansFeatureList;
