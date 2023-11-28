import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback, useState } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import type { AkismetProQuantityDropDownProps } from './types';
import type { FormSelectProps } from 'calypso/components/forms/form-select';
import type { FunctionComponent } from 'react';

const AkismetSitesSelectHeading = styled.div`
	font-size: 1.1em;
	color: ${ ( props ) => props.theme.colors.textColorDark };
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;

const AkismetSitesSelectLabel = styled.div`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-weight: ${ ( props ) => props.theme.weights.normal };
`;

const StyledFormSelect = styled( FormSelect )< FormSelectProps >`
	position: relative;
	width: 100%;
	margin: 16px 0 !important;
	border-radius: 3px;
	font-size: 14px;
`;

export const AkismetProQuantityDropDown: FunctionComponent< AkismetProQuantityDropDownProps > = ( {
	responseCart,
	onChangeAkProQuantity,
} ) => {
	const translate = useTranslate();

	const [ quantityState, setQuantityState ] = useState( responseCart.products[ 0 ].quantity ?? 1 );

	const onSitesQuantityChange = useCallback(
		( event: React.ChangeEvent< HTMLSelectElement > ) => {
			const quantity = parseInt( event.target?.value, 10 ) || 1;
			setQuantityState( quantity );
			const { uuid, product_slug: productSlug, product_id: productId } = responseCart.products[ 0 ];
			onChangeAkProQuantity &&
				onChangeAkProQuantity( uuid, productSlug, productId, Number( quantity ) );
		},
		[ onChangeAkProQuantity, responseCart.products ]
	);

	useEffect( () => {
		const { product_slug: productSlug, quantity } = responseCart.products[ 0 ];
		setQuantityState( quantity ?? 1 );

		// Update the product-slug quantity value in the url
		const urlQuantityPart = `:-q-${ quantity ?? 1 }`;
		const newUrl =
			window.location.protocol +
			'//' +
			window.location.host +
			'/checkout/akismet' +
			`/${ productSlug }` +
			urlQuantityPart +
			window.location.search +
			window.location.hash;
		window.history.replaceState( null, '', newUrl );
	}, [ responseCart.products ] );

	return (
		<div className="akismet-sites-select">
			<AkismetSitesSelectHeading>{ translate( 'Number of licenses' ) }</AkismetSitesSelectHeading>
			<FormLabel htmlFor="number-of-akismet-sites">
				<AkismetSitesSelectLabel>
					{ translate( 'On how many sites do you plan to use Akismet?' ) }
				</AkismetSitesSelectLabel>
			</FormLabel>
			<StyledFormSelect
				name="quantity"
				id="number-of-akismet-sites"
				value={ quantityState }
				onChange={ onSitesQuantityChange }
			>
				{ [ 1, 2, 3, 4 ].map( ( value ) => (
					<option key={ `quantity-${ value }` } value={ value }>
						{ translate( '%(count)d Site', '%(count)d Sites', {
							count: value,
							args: {
								count: value,
							},
						} ) }
					</option>
				) ) }
			</StyledFormSelect>
		</div>
	);
};

export * from './types';
