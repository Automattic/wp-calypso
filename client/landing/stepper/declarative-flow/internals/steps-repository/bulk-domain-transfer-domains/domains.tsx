import { Button, Card, CardHeader, CardBody, CardFooter } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { domainTransfer } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { ONBOARD_STORE } from '../../../../stores';
import { DomainCodePair } from './domain-code-pair';

export interface Props {
	onSubmit: () => void;
}

export const domains: Record<
	string,
	{
		domain: string;
		auth: string;
		valid: boolean;
	}
> = {
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
function distinctItems( domainsWithDupes: typeof domains ) {
	return Object.values( domainsWithDupes ).reduce( ( items, item ) => {
		items[ item.domain ] = item.auth;
		return items;
	}, {} as Record< string, string > );
}

const Domains: React.FC< Props > = ( { onSubmit } ) => {
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const { __ } = useI18n();

	const [ domainsState, setDomainsState ] = useState< typeof domains >( domains );
	const allGood = Object.values( domainsState ).every( ( { valid } ) => valid );

	// create a string key representing the current state of the domains
	const changeKey = JSON.stringify( domainsState );

	const handleAddTransfer = async () => {
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

			setPendingAction( cartPromise ).then( () => {
				onSubmit?.();
			} );
		}
	};

	const handleChange = useCallback(
		( id: string, value: { domain: string; auth: string; valid: boolean } ) => {
			const newDomainsState = { ...domainsState };
			newDomainsState[ id ] = value;
			setDomainsState( newDomainsState );
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
		setDomainsState( newDomainsState );
	}

	function removeDomain( key: string ) {
		const newDomainsState = { ...domainsState };
		delete newDomainsState[ key ];
		setDomainsState( newDomainsState );
	}

	return (
		<Card>
			<CardHeader>
				<h2>{ __( 'Domains' ) }</h2>
			</CardHeader>
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
			<CardFooter>
				<Button
					disabled={ ! allGood }
					className="bulk-domain-transfer__cta"
					isPrimary
					style={ { width: '100%' } }
					onClick={ handleAddTransfer }
				>
					{ __( 'Continue' ) }
				</Button>
			</CardFooter>
		</Card>
	);
};

export default Domains;
