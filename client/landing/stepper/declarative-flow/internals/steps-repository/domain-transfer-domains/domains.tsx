import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainTransferData } from '@automattic/data-stores';
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

const Domains: React.FC< Props > = ( { onSubmit } ) => {
	const [ enabledDataLossWarning, setEnabledDataLossWarning ] = useState( true );

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

	const allGood = Object.values( domainsState ).every( ( { valid } ) => valid );

	const hasAnyDomains = Object.values( domainsState ).some(
		( { domain, auth } ) => domain.trim() || auth.trim()
	);

	useDataLossWarning( hasAnyDomains && enabledDataLossWarning );

	// create a string key representing the current state of the domains
	const changeKey = JSON.stringify( domainsState );

	const handleAddTransfer = () => {
		recordTracksEvent( 'calypso_domain_transfer_submit_form', {
			valid: allGood,
			numberOfValidDomains: numberOfValidDomains,
		} );

		if ( allGood ) {
			const cartItems = Object.values( domainsState ).map( ( { domain, auth } ) =>
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
			setDomainsTransferData( newDomainsState );
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
		setDomainsTransferData( newDomainsState );
	}

	function removeDomain( key: string ) {
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
					showDelete={ Object.values( domainsState ).length > 1 }
				/>
			) ) }
			{ domainCount < MAX_DOMAINS && (
				<Button className="bulk-domain-transfer__add-domain" icon={ plus } onClick={ addDomain }>
					{ __( 'Add another domain' ) }
				</Button>
			) }
			<div className="bulk-domain-transfer__cta-container">
				<Button
					disabled={ numberOfValidDomains === 0 }
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
