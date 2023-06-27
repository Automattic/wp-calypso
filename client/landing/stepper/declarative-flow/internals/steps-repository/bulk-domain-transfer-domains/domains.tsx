import { domainProductSlugs } from '@automattic/calypso-products';
import { BulkDomainTransferData } from '@automattic/data-stores';
import { useDataLossWarning } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import { ButtonGroup, Button, Card, CardHeader, CardBody, CardFooter } from '@wordpress/components';
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

export interface Props {
	onSubmit: () => void;
}

const defaultState: BulkDomainTransferData = {
	[ uuid() ]: {
		domain: '',
		auth: '',
		valid: false,
	},
};

/**
 * Remove duplicate domains from the list
 *
 * @param domainsWithDupes domains
 */
function distinctItems( domainsWithDupes: BulkDomainTransferData ) {
	return Object.values( domainsWithDupes ).reduce( ( items, item ) => {
		items[ item.domain ] = item.auth;
		return items;
	}, {} as Record< string, string > );
}

const Domains: React.FC< Props > = ( { onSubmit } ) => {
	const [ enabledDataLossWarning, setEnabledDataLossWarning ] = useState( true );
	const [ ignoreCart, setIgnoreCart ] = useState( false );

	const storedDomainsState = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getBulkDomainsData(),
		[]
	);
	const domainsState = storedDomainsState || defaultState;

	const { responseCart } = useShoppingCart( 'no-site' );

	const domainTransfersInCart = responseCart?.products.filter( ( { product_slug } ) => {
		return product_slug === domainProductSlugs.TRANSFER_IN;
	} );

	const hasDomainsInCart = domainTransfersInCart?.length > 0;

	const { setPendingAction, setBulkDomainsData } = useDispatch( ONBOARD_STORE );

	const { __, _n } = useI18n();

	const allGood = Object.values( domainsState ).every( ( { valid } ) => valid );

	const hasAnyDomains = Object.values( domainsState ).some(
		( { domain, auth } ) => domain.trim() || auth.trim()
	);

	useDataLossWarning( hasAnyDomains && enabledDataLossWarning );

	// create a string key representing the current state of the domains
	const changeKey = JSON.stringify( domainsState );

	const handleAddTransfer = () => {
		if ( allGood ) {
			const distinctDomains = distinctItems( domainsState );
			const cartItems = Object.entries( distinctDomains ).map( ( [ domain, auth ] ) =>
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

	const handleChange = useCallback(
		( id: string, value: { domain: string; auth: string; valid: boolean } ) => {
			const newDomainsState = { ...domainsState };
			newDomainsState[ id ] = value;
			setBulkDomainsData( newDomainsState );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ changeKey ]
	);

	function addDomain() {
		const newDomainsState = { ...domainsState };
		newDomainsState[ uuid() ] = {
			domain: '',
			auth: '',
			valid: false,
		};
		setBulkDomainsData( newDomainsState );
	}

	function removeDomain( key: string ) {
		const newDomainsState = { ...domainsState };
		delete newDomainsState[ key ];
		setBulkDomainsData( newDomainsState );
	}

	return (
		<Card>
			<CardHeader>
				<h2>{ __( 'Domains' ) }</h2>
			</CardHeader>
			{ hasDomainsInCart && ! ignoreCart ? (
				<CardBody>
					{ sprintf(
						/* translators: %s: number of domains in cart */
						_n(
							'You already have %s domain in cart. Would you like to proceed to checkout or start over?',
							'You already have %s domains in cart. Would you like to proceed to checkout or start over?',
							domainTransfersInCart.length
						),
						domainTransfersInCart.length
					) }
				</CardBody>
			) : (
				<CardBody>
					{ Object.entries( domainsState ).map( ( [ key, domain ], index ) => (
						<DomainCodePair
							key={ key }
							id={ key }
							onChange={ handleChange }
							onRemove={ removeDomain }
							domain={ domain.domain }
							auth={ domain.auth }
							showLabels={ index === 0 }
						/>
					) ) }
					<Button className="bulk-domain-transfer__add-domain" icon={ plus } onClick={ addDomain }>
						{ __( 'Add domain' ) }
					</Button>
				</CardBody>
			) }
			<CardFooter>
				{ hasDomainsInCart && ! ignoreCart ? (
					<ButtonGroup style={ { width: '100%' } }>
						<Button onClick={ () => setIgnoreCart( true ) }>{ __( 'Start over' ) }</Button>
						<Button isPrimary onClick={ () => onSubmit() }>
							{ __( 'Continue to checkout' ) }
						</Button>
					</ButtonGroup>
				) : (
					<Button
						disabled={ ! allGood }
						className="bulk-domain-transfer__cta"
						isPrimary
						style={ { width: '100%' } }
						onClick={ handleAddTransfer }
					>
						{ __( 'Continue' ) }
					</Button>
				) }
			</CardFooter>
		</Card>
	);
};

export default Domains;
