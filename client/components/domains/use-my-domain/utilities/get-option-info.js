/**
 * Internal dependencies
 */
import { domainAvailability } from 'calypso/lib/domains/constants';
import {
	getMappingFreeText,
	getMappingPriceText,
	getTransferFreeText,
	getTransferPriceText,
	getTransferSalePriceText,
	isFreeTransfer,
	optionInfo,
} from './index';

export function getOptionInfo( {
	availability,
	cart,
	currencyCode,
	domain,
	isSignupStep,
	primaryWithPlansOnly,
	productsList,
	selectedSite,
} ) {
	const mappingFreeText = getMappingFreeText( {
		cart,
		domain,
		primaryWithPlansOnly,
		selectedSite,
	} );

	const mappingPriceText = getMappingPriceText( {
		cart,
		currencyCode,
		domain,
		productsList,
		selectedSite,
	} );

	const transferFreeText = getTransferFreeText( {
		cart,
		domain,
		isSignupStep,
		selectedSite,
	} );

	const transferSalePriceText = getTransferSalePriceText( {
		cart,
		currencyCode,
		domain,
		productsList,
	} );

	const transferPriceText = getTransferPriceText( {
		cart,
		currencyCode,
		domain,
		productsList,
	} );

	const transferPricing = {
		isFree: isFreeTransfer( { cart, domain } ),
		text: transferFreeText,
		sale: transferSalePriceText,
		cost: transferPriceText,
	};

	const mappingPricing = {
		text: mappingFreeText,
		cost: mappingPriceText,
	};

	let transferContent;
	switch ( availability.status ) {
		case domainAvailability.TRANSFERRABLE:
			transferContent = {
				...optionInfo.transferSupported,
				pricing: transferPricing,
			};
			break;
		default:
			transferContent = optionInfo.transferNotSupported;
	}

	const connectContent = { ...optionInfo.connectSupported, pricing: mappingPricing };

	if ( domainAvailability.TRANSFERRABLE === availability.status ) {
		return [ { ...transferContent, primary: true }, connectContent ];
	}

	return [ { ...connectContent, primary: true }, transferContent ];
}
