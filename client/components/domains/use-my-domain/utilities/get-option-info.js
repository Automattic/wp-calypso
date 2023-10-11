import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import page from 'page';
import { getTld } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';
import { getTransferCostText } from './get-transfer-cost-text';
import {
	getMappingFreeText,
	getTransferFreeText,
	getTransferRestrictionMessage,
	getTransferSalePriceText,
	isFreeTransfer,
	optionInfo,
} from './index';

export const getDomainTransferrability = ( domainInboundTransferStatusInfo ) => {
	if ( ! domainInboundTransferStatusInfo ) {
		return {
			transferrable: false,
			domainTransferContent: {
				...optionInfo.transferNotSupported,
				topText: optionInfo.transferNotSupported.topText,
			},
		};
	}

	const { inRedemption, transferEligibleDate } = domainInboundTransferStatusInfo;

	const result = {
		transferrable: ! inRedemption && null === transferEligibleDate,
	};

	if ( ! result.transferrable ) {
		result.domainTransferContent = {
			...optionInfo.transferNotSupported,
			topText:
				getTransferRestrictionMessage( domainInboundTransferStatusInfo ) ??
				optionInfo.transferNotSupported.topText,
		};
	}

	return result;
};

export function getOptionInfo( {
	availability,
	cart,
	currencyCode,
	domain,
	isSignupStep,
	onConnect,
	onSkip,
	onTransfer,
	primaryWithPlansOnly,
	productsList,
	selectedSite,
	siteIsOnPaidPlan,
} ) {
	availability = availability ?? {};
	const mappingFreeText = getMappingFreeText( {
		cart,
		domain,
		primaryWithPlansOnly,
		selectedSite,
		isSignupStep,
	} );

	const transferFreeText = getTransferFreeText( {
		cart,
		domain,
		isSignupStep,
		siteIsOnPaidPlan,
		availability,
	} );

	const transferCostText = getTransferCostText( {
		cart,
		currencyCode,
		domain,
		productsList,
		availability,
	} );

	const transferSalePriceText = getTransferSalePriceText( {
		cart,
		currencyCode,
		domain,
		productsList,
		availability,
	} );

	const transferPricing = {
		isFree: isFreeTransfer( { cart, domain, availability } ),
		cost: transferCostText,
		sale: transferSalePriceText,
		text: transferFreeText,
	};

	const mappingPricing = {
		text: mappingFreeText,
	};

	let transferContent;
	switch ( availability.status ) {
		case domainAvailability.TRANSFERRABLE:
		case domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE:
		case domainAvailability.TRANSFERRABLE_PREMIUM:
			if ( availability?.is_price_limit_exceeded === true ) {
				transferContent = {
					...optionInfo.transferNotSupported,
					topText: __(
						"We're sorry but we can't transfer your domain as it is a high tier premium name that we don't support."
					),
				};
			} else {
				transferContent = {
					...optionInfo.transferSupported,
					pricing: transferPricing,
					onSelect: onTransfer,
					primary: true,
				};
			}
			break;
		case domainAvailability.TLD_NOT_SUPPORTED:
			transferContent = {
				...optionInfo.transferNotSupported,
				topText: createInterpolateElement(
					sprintf(
						/* translators: %s - the TLD extension of the domain the user wanted to transfer (ex.: com, net, org, etc.) */
						__(
							"We don't support transfers for domains ending with <strong>.%s</strong>, but you can connect it instead."
						),
						availability.tld || getTld( domain )
					),
					{ strong: createElement( 'strong' ) }
				),
			};
			break;
		case domainAvailability.MAPPABLE:
			transferContent = {
				...optionInfo.transferNotSupported,
				topText: createInterpolateElement(
					sprintf(
						/* translators: %s - the domain the user wanted to transfer */
						__( "<strong>%s</strong> can't be transferred, but you can connect it instead." ),
						domain
					),
					{ strong: createElement( 'strong' ) }
				),
			};
			break;
		case domainAvailability.RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE:
			transferContent = {
				...optionInfo.transferNotSupported,
				topText: createInterpolateElement(
					sprintf(
						/* translators: %s - the domain the user wanted to transfer */
						__(
							"<strong>%s</strong> can't be transferred because it was registered less than 60 days ago, but you can connect it instead."
						),
						domain
					),
					{ strong: createElement( 'strong' ) }
				),
			};
			break;
		case domainAvailability.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE:
			transferContent = {
				...optionInfo.transferNotSupported,
				topText: createInterpolateElement(
					sprintf(
						/* translators: %s - the domain the user wanted to transfer */
						__(
							"<strong>%s</strong> can't be transferred due to a transfer lock at the registry, but you can connect it instead."
						),
						domain
					),
					{ strong: createElement( 'strong' ) }
				),
			};
			break;
		default: {
			const availabilityNotice = getAvailabilityNotice( domain, availability.status );
			transferContent = {
				...optionInfo.transferNotSupported,
				topText: availabilityNotice.message,
			};
		}
	}

	let connectContent;
	if ( domainAvailability.MAPPABLE === availability.mappable ) {
		connectContent = {
			...optionInfo.connectSupported,
			onSelect: onConnect,
			pricing: mappingPricing,
		};

		// We currently aren't handling ownership verification for mapped domains during sign-up or for free
		// sites without a plan. See https://github.com/Automattic/nomado-issues/issues/136 for more context
		if (
			availability.ownership_verification_type !== 'no_verification_required' &&
			! siteIsOnPaidPlan
		) {
			const action = isSignupStep ? () => onSkip() : () => page( `/plans/${ selectedSite?.slug }` );

			connectContent = {
				...connectContent,
				benefits: [],
				topText: createInterpolateElement(
					sprintf(
						/* translators: %s - the domain the user wanted to connect */
						__(
							"We need to verify you are the owner of <strong>%s</strong> before connecting it, but we're not able to do that without a plan.<br /><br />Please <a>purchase a plan</a> first in order to connect your domain."
						),
						domain
					),
					{
						strong: createElement( 'strong' ),
						br: createElement( 'br' ),
						a: createElement( 'a', { onClick: action } ),
					}
				),
				pricing: null,
				learnMoreLink: null,
				onSelect: action,
				onSelectText: __( 'Purchase a plan' ),
			};
		}
	} else {
		switch ( availability.status ) {
			case domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE:
				connectContent = {
					...optionInfo.connectNotSupported,
					topText: __(
						'This domain is already connected to your site, but you can still transfer it.'
					),
				};
				break;
			default:
				connectContent = optionInfo.connectNotSupported;
		}
	}

	if ( transferContent.onSelect && connectContent.onSelect ) {
		transferContent.recommended = true;
	}

	connectContent.primary = ! transferContent?.primary;

	if ( transferContent?.primary ) {
		return [ transferContent, connectContent ];
	}

	return [ { ...connectContent, primary: true }, transferContent ];
}
