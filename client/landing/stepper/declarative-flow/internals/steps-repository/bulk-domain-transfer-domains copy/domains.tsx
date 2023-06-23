import { Button, Card, CardHeader, CardBody, CardFooter } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { DomainCodePair } from './domain-code-pair';

export interface Props {
	onSubmit: () => void;
}

const hash = ( [ key, value ] ) => `${ key }:${ value }`;

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

const Domains: React.FC< Props > = ( { onSubmit } ) => {
	const { __ } = useI18n();

	const [ domainsState, setDomainsState ] = useState< typeof domains >( domains );

	const changeKey = Object.entries( domainsState ).map( hash ).join( ',' );

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

	const allGood = Object.values( domainsState ).every( ( { valid } ) => valid );

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
				>
					{ __( 'Continue' ) }
				</Button>
			</CardFooter>
		</Card>
	);
};

export default Domains;
