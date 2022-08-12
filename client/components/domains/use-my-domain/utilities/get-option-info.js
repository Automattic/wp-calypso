import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { getTld } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';
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
	} );

	const transferSalePriceText = getTransferSalePriceText( {
		cart,
		currencyCode,
		domain,
		productsList,
	} );

	const transferPricing = {
		isFree: isFreeTransfer( { cart, domain } ),
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
			transferContent = {
				...optionInfo.transferSupported,
				pricing: transferPricing,
				onSelect: onTransfer,
				primary: true,
			};
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
						getTld( domain )
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
