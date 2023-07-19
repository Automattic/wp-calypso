import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { DomainTransferData, DomainTransferForm } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { useDataLossWarning } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import { domainTransfer } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { ONBOARD_STORE } from '../../../../stores';
import { DomainCodePair } from './domain-code-pair';
import DomainTransferFAQ from './faqs';
import type { OnboardSelect } from '@automattic/data-stores';

const MAX_DOMAINS = 50;

export interface Props {
	onSubmit: () => void;
}

const defaultState: DomainTransferForm = {
	shouldImportDnsRecords: true,
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

const getFormattedTotalPrice = ( state: DomainTransferData ) => {
	if ( Object.keys( state ).length > 0 ) {
		const currencyCode = Object.values( state )[ 0 ].currencyCode;
		const totalPrice = Object.values( state ).reduce( ( total, currentDomain ) => {
			if ( currentDomain.saleCost || currentDomain.saleCost === 0 ) {
				return total + currentDomain.saleCost;
			}

			return total + currentDomain.rawPrice;
		}, 0 );

		return formatCurrency( totalPrice, currencyCode ?? 'USD', { stripZeros: true } );
	}

	return 0;
};

const Domains: React.FC< Props > = ( { onSubmit } ) => {
	const [ enabledDataLossWarning, setEnabledDataLossWarning ] = useState( true );

	const storedDomainsState = useSelect( ( select ) => {
		const onboardSelect = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			shouldImportDnsRecords: onboardSelect.getBulkDomainsImportDnsRecords(),
			domains: onboardSelect.getBulkDomainsData(),
		};
	}, [] );
	const domainsState = storedDomainsState.domains || defaultState.domains;

	const domainCount = Object.keys( domainsState ).length;

	const numberOfValidDomains = Object.values( domainsState ).filter(
		( { valid } ) => valid
	).length;

	const { setPendingAction, setDomainsTransferData, setShouldImportDomainTransferDnsRecords } =
		useDispatch( ONBOARD_STORE );

	const { __, _n } = useI18n();

	const filledDomainValues = Object.values( domainsState ).filter( ( x ) => x.domain && x.auth );
	const allGood = filledDomainValues.every( ( { valid } ) => valid );

	const hasAnyDomains = Object.values( domainsState ).some(
		( { domain, auth } ) => domain.trim() || auth.trim()
	);

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
						import_dns_records: storedDomainsState.shouldImportDnsRecords,
					},
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

	return (
		<div className="bulk-domain-transfer__container">
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
				/>
			) ) }
			{ domainCount < MAX_DOMAINS && (
				<Button className="bulk-domain-transfer__add-domain" icon={ plus } onClick={ addDomain }>
					{ __( 'Add more' ) }
				</Button>
			) }
			{ numberOfValidDomains > 0 && (
				<>
					<div className="bulk-domain-transfer__total-price">
						<div>{ __( 'Total' ) }</div>
						<div>{ getFormattedTotalPrice( domainsState ) }</div>
					</div>

					<FormLabel
						htmlFor="import-dns-records"
						className="bulk-domain-transfer__import-dns-records"
					>
						<FormInputCheckbox
							id="import-dns-records"
							onChange={ ( event ) => {
								setShouldImportDomainTransferDnsRecords( event.target.checked );
							} }
							checked={ storedDomainsState.shouldImportDnsRecords }
						/>
						<span>{ __( 'Import DNS records from these domains' ) }</span>
					</FormLabel>
				</>
			) }
			<div className="bulk-domain-transfer__cta-container">
				<Button
					disabled={ numberOfValidDomains === 0 || ! allGood }
					className="bulk-domain-transfer__cta"
					onClick={ handleAddTransfer }
				>
					{ numberOfValidDomains === 0
						? __( 'Transfer' )
						: sprintf(
								/* translators: %s: number valid domains */
								_n( 'Transfer %s domain', 'Transfer %s domains', numberOfValidDomains ),
								numberOfValidDomains
						  ) }
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
