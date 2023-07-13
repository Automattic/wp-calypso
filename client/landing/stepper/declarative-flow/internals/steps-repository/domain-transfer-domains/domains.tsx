import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainTransferData } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { useDataLossWarning } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { domainTransfer } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { ONBOARD_STORE } from '../../../../stores';
import { DomainCodePair } from './domain-code-pair';
import type { OnboardSelect } from '@automattic/data-stores';

const MAX_DOMAINS = 50;

export interface Props {
	onSubmit: () => void;
}

const defaultState: DomainTransferData = {
	[ uuid() ]: {
		domain: '',
		auth: '',
		valid: false,
	},
};

type DomainPrices = Record< string, number >;

const Domains: React.FC< Props > = ( { onSubmit } ) => {
	const [ enabledDataLossWarning, setEnabledDataLossWarning ] = useState( true );
	const [ domainPrices, setDomainPrices ] = useState< DomainPrices >( {} );

	const storedDomainsState = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getBulkDomainsData(),
		[]
	);
	const domainsState = storedDomainsState || defaultState;

	const domainCount = Object.keys( domainsState ).length;

	const numberOfValidDomains = Object.values( domainsState ).filter(
		( { valid } ) => valid
	).length;

	const { setPendingAction, setDomainsTransferData } = useDispatch( ONBOARD_STORE );

	const { __, _n } = useI18n();

	const filledDomainValues = Object.values( domainsState ).filter( ( x ) => x.domain && x.auth );
	const allGood = filledDomainValues.every( ( { valid } ) => valid );

	const hasAnyDomains = Object.values( domainsState ).some(
		( { domain, auth } ) => domain.trim() || auth.trim()
	);

	useDataLossWarning( hasAnyDomains && enabledDataLossWarning );

	// create a string key representing the current state of the domains
	const changeKey = JSON.stringify( domainsState );
	const pricesChangeKey = JSON.stringify( domainPrices );

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

	const updateTotalPrice = useCallback(
		( id: string, price: number ) => {
			const newDomainPrices = { ...domainPrices };
			newDomainPrices[ id ] = price;
			setDomainPrices( newDomainPrices );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ pricesChangeKey ]
	);

	const totalPrice = Object.values( domainPrices ).reduce( ( a, b ) => a + b, 0 );

	const handleChange = useCallback(
		( id: string, value: { domain: string; auth: string; valid: boolean } ) => {
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
					showLabels={ index === 0 }
					hasDuplicates={ Object.values( domainsState ).some(
						( { domain: otherDomain }, otherIndex ) =>
							otherDomain && otherDomain === domain.domain && otherIndex < index
					) }
					showDelete={ domainCount > 1 && index > 0 }
				/>
			) ) }
			{ domainCount < MAX_DOMAINS && (
				<Button className="bulk-domain-transfer__add-domain" icon={ plus } onClick={ addDomain }>
					{ __( 'Add another domain' ) }
				</Button>
			) }
			<div className="bulk-domain-transfer__total-price">
				<div>{ __( 'Total' ) }</div>
				<div>{ formatCurrency( totalPrice, 'USD', { stripZeros: true } ) }</div>
			</div>
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
		</div>
	);
};

export default Domains;
