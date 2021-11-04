import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import './style.scss';

interface ProductOption {
	value: string;
	label: string;
	cost: number;
	currency: string;
}

function selectProductOptions( families: APIProductFamily[] ): ProductOption[] {
	return families.flatMap( ( family ) =>
		family.products.map( ( product ) => ( {
			value: product.slug,
			label: product.name,
			cost: product.cost,
			currency: product.currency,
		} ) )
	);
}

export default function IssueLicenseForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const products = useProductsQuery( {
		select: selectProductOptions,
	} );

	const issueLicense = useIssueLicenseMutation( {
		onSuccess: ( license ) => {
			page.redirect(
				addQueryArgs( { highlight: license.license_key }, '/partner-portal/licenses' )
			);
		},
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message ) );
		},
	} );
	const [ product, setProduct ] = useState( '' );

	const onSelectProduct = useCallback(
		( option ) => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select', {
					product: option.value,
				} )
			);
			setProduct( option.value );
		},
		[ setProduct ]
	);

	const productCards =
		products.data &&
		products.data.map( ( prod, i ) => (
			<LicenseProductCard
				key={ prod.value }
				product={ prod }
				onSelectProduct={ onSelectProduct }
				isSelected={ prod.value === product }
				orderIndex={ i }
			/>
		) );

	const onIssueLicense = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_issue_license_submit', { product } ) );
		issueLicense.mutate( { product } );
	}, [ dispatch, product, issueLicense.mutate ] );

	return (
		<div className="issue-license-form">
			<div className="issue-license-form__top">
				<p className="issue-license-form__description">
					{ translate( 'Select the Jetpack product you would like to issue a new license for' ) }
				</p>
				<div className="issue-license-form__controls">
					<Button primary onClick={ onIssueLicense }>
						{ translate( 'Select License' ) }
					</Button>
				</div>
			</div>
			<div className="issue-license-form__bottom">{ productCards }</div>
		</div>
	);
}
