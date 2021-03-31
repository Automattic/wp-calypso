/**
 * External dependencies
 */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from 'react-query';
import { useTranslate } from 'i18n-calypso';
import classnames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { addQueryArgs } from 'calypso/lib/url';
import { errorNotice } from 'calypso/state/notices/actions';
import SelectDropdown from 'calypso/components/select-dropdown';
import Spinner from 'calypso/components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

interface ProductOption {
	value: string;
	label: string;
}

interface APILicense {
	license_key: string;
}

export interface APIProductFamilyProduct {
	name: string;
	slug: string;
	product_id: number;
}

export interface APIProductFamily {
	name: string;
	slug: string;
	products: APIProductFamilyProduct[];
}

function queryProducts(): Promise< ProductOption[] > {
	return wpcom.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/product-families',
		} )
		.then( ( families: APIProductFamily[] ) =>
			families.flatMap( ( family ) =>
				family.products.map( ( product ) => ( {
					value: product.slug,
					label: product.name,
				} ) )
			)
		);
}

function mutationIssueLicense( product: string ): Promise< APILicense > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/license',
		body: { product },
	} );
}

export default function IssueLicenseForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const query = useQuery( [ 'partner-portal', 'products' ], queryProducts );
	const mutation = useMutation( mutationIssueLicense, {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message ) );
		},
		onSuccess: ( license ) => {
			page.redirect( addQueryArgs( { highlight: license.license_key }, '/partner-portal' ) );
		},
	} );
	const [ product, setProduct ] = useState( '' );

	const onSelectProduct = useCallback( ( option ) => setProduct( option.value ), [ setProduct ] );

	const onIssueLicense = useCallback( () => {
		mutation.mutate( product );
	}, [ product, mutation.mutate ] );

	useEffect( () => {
		// Make sure we keep product in sync with the query results.
		if ( ! query.data || query.data.length === 0 ) {
			return;
		}

		const found = query.data.find( ( option ) => option.value === product );

		if ( ! found ) {
			setProduct( query.data[ 0 ].value );
		}
	}, [ product, query.data, setProduct ] );

	return (
		<Card className="issue-license-form">
			<p>{ translate( 'Select a product you want to issue a license for' ) }</p>

			{ query.isLoading && <div className="issue-license-form__placeholder" /> }

			{ ! query.isLoading && (
				<SelectDropdown
					initialSelected={ product }
					options={ query.data }
					onSelect={ onSelectProduct }
				/>
			) }

			<div className="issue-license-form__actions">
				<Button href="/partner-portal">{ translate( 'Go back' ) }</Button>

				<Button
					className={ classnames( 'issue-license-form__issue-button', {
						'issue-license-form__issue-button--is-loading': mutation.isLoading,
					} ) }
					primary
					disabled={ query.isLoading || mutation.isLoading }
					onClick={ onIssueLicense }
				>
					<span>{ translate( 'Issue License' ) }</span>

					{ mutation.isLoading && <Spinner /> }
				</Button>
			</div>
		</Card>
	);
}
