import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { DomainTransferData, DomainTransferForm } from '@automattic/data-stores';
import { HUNDRED_YEAR_DOMAIN_TRANSFER, useDataLossWarning } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { formatCurrency } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import QueryProducts from 'calypso/components/data/query-products-list';
import { domainTransfer } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { ONBOARD_STORE } from '../../../../stores';
import { DomainCodePair } from './domain-code-pair';
import DomainTransferFAQ from './faqs';
import type { OnboardSelect } from '@automattic/data-stores';

export interface Props {
	onSubmit: () => void;
	variantSlug: string | undefined;
}

const defaultState: DomainTransferForm = {
	domains: {
		[ uuid() ]: {
			domain: '',
			auth: '',
			valid: false,
			rawPrice: 0,
			saleCost: undefined,
			currencyCode: 'USD',
		},
	},
};

const getTotalPrice = ( state: DomainTransferData ) => {
	if ( Object.keys( state ).length > 0 ) {
		return Object.values( state ).reduce( ( total, currentDomain ) => {
			if ( currentDomain.saleCost || currentDomain.saleCost === 0 ) {
				return total + currentDomain.saleCost;
			}

			return total + currentDomain.rawPrice;
		}, 0 );
	}

	return 0;
};

const getFormattedTotalPrice = ( state: DomainTransferData ) => {
	if ( Object.keys( state ).length > 0 ) {
		const currencyCode = Object.values( state )[ 0 ].currencyCode;
		const totalPrice = getTotalPrice( state );

		return formatCurrency( totalPrice, currencyCode ?? 'USD', { stripZeros: true } );
	}

	return 0;
};

const Domains: React.FC< Props > = ( { onSubmit, variantSlug } ) => {
	const [ enabledDataLossWarning, setEnabledDataLossWarning ] = useState( true );
	const newDomainTransferQueryArg = getQueryArg( window.location.search, 'new' );

	const storedDomainsState = useSelect( ( select ) => {
		const onboardSelect = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			domains: onboardSelect.getBulkDomainsData(),
		};
	}, [] );
	const domainsState = storedDomainsState.domains || defaultState.domains;

	const domainCount = Object.keys( domainsState ).length;

	const numberOfValidDomains = Object.values( domainsState ).filter(
		( { valid } ) => valid
	).length;

	const { setPendingAction, setDomainsTransferData } = useDispatch( ONBOARD_STORE );

	const { __ } = useI18n();

	const filledDomainValues = Object.values( domainsState ).filter( ( x ) => x.domain && x.auth );
	const allGood = filledDomainValues.every( ( { valid } ) => valid );

	const hasAnyDomains = Object.values( domainsState ).some(
		( { domain, auth } ) => domain.trim() || auth.trim()
	);

	const isHundredYearTransfer = variantSlug === HUNDRED_YEAR_DOMAIN_TRANSFER;

	useDataLossWarning( hasAnyDomains && enabledDataLossWarning );

	// create a string key representing the current state of the domains
	const changeKey = JSON.stringify( domainsState );

	const handleAddTransfer = () => {
		recordTracksEvent( 'calypso_domain_transfer_submit_form', {
			valid: allGood,
			number_of_valid_domains: numberOfValidDomains,
		} );

		if ( allGood ) {
			const cartItems = filledDomainValues.map( ( { domain, auth } ) =>
				domainTransfer( {
					domain,
					extra: {
						auth_code: auth,
						signup: false,
						import_dns_records: true,
						is_hundred_year_domain: isHundredYearTransfer,
					},
					volume: isHundredYearTransfer ? 100 : 1,
				} )
			);

			const cartPromise = cartManagerClient
				.forCartKey( 'no-site' )
				.actions.replaceProductsInCart( cartItems );

			setEnabledDataLossWarning( false );

			setPendingAction( () => cartPromise ).then( () => {
				onSubmit?.();
			} );
		}
	};

	const handleChange = useCallback(
		(
			id: string,
			value: {
				domain: string;
				auth: string;
				valid: boolean;
				rawPrice: number;
				saleCost?: number;
				currencyCode: string;
			}
		) => {
			const newDomainsState = { ...domainsState };
			newDomainsState[ id ] = value;
			setDomainsTransferData( newDomainsState );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ changeKey ]
	);

	function addDomain() {
		recordTracksEvent( 'calypso_domain_transfer_add_domain', {
			resulting_domain_count: domainCount + 1,
		} );
		const newDomainsState = { ...domainsState };
		newDomainsState[ uuid() ] = {
			domain: '',
			auth: '',
			valid: false,
			rawPrice: 0,
			saleCost: undefined,
			currencyCode: undefined,
		};
		setDomainsTransferData( newDomainsState );
	}

	function removeDomain( key: string ) {
		recordTracksEvent( 'calypso_domain_transfer_remove_domain', {
			resulting_domain_count: domainCount - 1,
		} );
		const newDomainsState = { ...domainsState };
		delete newDomainsState[ key ];
		setDomainsTransferData( newDomainsState );
	}

	function getTransferButtonText() {
		if ( numberOfValidDomains === 0 ) {
			return __( 'Transfer' );
		}

		const totalPrice = getTotalPrice( domainsState );
		if ( totalPrice ) {
			const formattedTotalPrice = getFormattedTotalPrice( domainsState );

			if ( numberOfValidDomains > 1 ) {
				return sprintf(
					/* translators: %1$s Number of valid domains, %2$s: total price formatted */
					__( 'Transfer %1$s domains for %2$s' ),
					numberOfValidDomains,
					formattedTotalPrice
				);
			}

			return sprintf(
				/* translators: %s: total price formatted */
				__( 'Transfer for %s' ),
				formattedTotalPrice
			);
		}

		return __( 'Start transfer' );
	}

	const setNewDomainFromQueryArg = () => {
		let duplicateDomain = false;
		const newDomainsState = { ...domainsState };
		const domainKeys = Object.keys( newDomainsState );
		const domainTransferObj = {
			domain: String( newDomainTransferQueryArg ),
			auth: '',
			valid: false,
			rawPrice: 0,
			saleCost: undefined,
			currencyCode: undefined,
		};

		if ( domainKeys.length === 1 && newDomainsState[ domainKeys[ 0 ] ].domain === '' ) {
			newDomainsState[ domainKeys[ 0 ] ] = { ...domainTransferObj };
		} else {
			// Check if the domain already exists in the state
			Object.keys( newDomainsState ).forEach( ( domainData ) => {
				if ( newDomainsState[ domainData ].domain === newDomainTransferQueryArg ) {
					duplicateDomain = true;
				}
			} );

			newDomainsState[ uuid() ] = { ...domainTransferObj };

			// Only keep the latest entry - 100-year domain flows are only
			// allowed to have one domain at a time, so always keep the latest
			// one and remove the rest.
			if ( isHundredYearTransfer ) {
				Object.entries( newDomainsState ).forEach( ( [ key, domainObject ] ) => {
					if ( domainObject.domain !== newDomainTransferQueryArg ) {
						delete newDomainsState[ key ];
					}
				} );
			}
		}

		if ( ! duplicateDomain ) {
			setDomainsTransferData( newDomainsState );
		}
	};

	useEffect( () => {
		if ( newDomainTransferQueryArg ) {
			setNewDomainFromQueryArg();
		}
	}, [] );

	return (
		<div className="bulk-domain-transfer__container">
			{ /** QueryProducts added to ensure currency-code state gets populated for usages of getCurrentUserCurrencyCode */ }
			<QueryProducts />
			{ Object.entries( domainsState ).map( ( [ key, domain ], index ) => (
				<DomainCodePair
					key={ key }
					id={ key }
					onChange={ handleChange }
					onRemove={ removeDomain }
					domain={ domain.domain }
					auth={ domain.auth }
					domainCount={ domainCount }
					showLabels={ index === 0 }
					hasDuplicates={ Object.values( domainsState ).some(
						( { domain: otherDomain }, otherIndex ) =>
							otherDomain && otherDomain === domain.domain && otherIndex < index
					) }
					variantSlug={ variantSlug }
				/>
			) ) }
			{ ! isHundredYearTransfer && (
				<Button className="bulk-domain-transfer__add-domain" icon={ plus } onClick={ addDomain }>
					{ __( 'Add more' ) }
				</Button>
			) }
			<div className="bulk-domain-transfer__cta-container">
				<Button
					disabled={ numberOfValidDomains === 0 || ! allGood }
					className="bulk-domain-transfer__cta"
					variant="primary"
					onClick={ handleAddTransfer }
				>
					{ getTransferButtonText() }
				</Button>
			</div>
			{ isEnabled( 'domain-transfer/faq' ) && (
				<div className="bulk-domain-transfer__faqs">
					<DomainTransferFAQ />
				</div>
			) }
		</div>
	);
};

export default Domains;
