import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLicenseIssuing } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { selectAlphaticallySortedProductOptions } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import type { IssueMultipleLicensesFormProps } from './types';
import './style.scss';

export default function IssueMultipleLicensesForm( {
	selectedSite,
}: IssueMultipleLicensesFormProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: allProducts, isLoading: isLoadingProducts } = useProductsQuery( {
		select: selectAlphaticallySortedProductOptions,
	} );

	const bundles =
		allProducts?.filter( ( { family_slug } ) => family_slug === 'jetpack-packs' ) || [];
	const products =
		allProducts?.filter( ( { family_slug } ) => family_slug !== 'jetpack-packs' ) || [];

	const defaultProduct = ( getQueryArg( window.location.href, 'product' ) || '' ).toString();
	const [ product, setProduct ] = useState( defaultProduct );
	const [ issueLicense, isLoading ] = useLicenseIssuing( product, selectedSite );

	const onSelectProduct = useCallback(
		( value ) => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select', {
					product: value,
				} )
			);
			setProduct( value );
		},
		[ setProduct ]
	);

	const selectedSiteDomain = selectedSite?.domain;

	return (
		<div className="issue-multiple-licenses-form">
			{ isLoadingProducts && <div className="issue-multiple-licenses-form__placeholder" /> }

			{ ! isLoadingProducts && (
				<>
					<div className="issue-multiple-licenses-form__top">
						<p className="issue-multiple-licenses-form__description">
							{ selectedSiteDomain
								? translate(
										'Select the Jetpack products you would like to add to {{strong}}%(selectedSiteDomian)s{{/strong}}:',
										{
											args: { selectedSiteDomain },
											components: { strong: <strong /> },
										}
								  )
								: translate(
										'Select the Jetpack products you would like to issue a new license for:'
								  ) }
						</p>
						<div className="issue-multiple-licenses-form__controls">
							<Button
								primary
								className="issue-multiple-licenses-form__select-license"
								disabled={ ! product }
								busy={ isLoading }
								onClick={ issueLicense }
							>
								{ translate( 'Select License' ) }
							</Button>
						</div>
					</div>
					<div className="issue-multiple-licenses-form__bottom">
						{ products &&
							products.map( ( productOption, i ) => (
								<LicenseProductCard
									key={ productOption.slug }
									product={ productOption }
									onSelectProduct={ onSelectProduct }
									isSelected={ productOption.slug === product }
									tabIndex={ 100 + i }
								/>
							) ) }
					</div>
					<hr className="issue-multiple-licenses-form__separator" />
					<p className="issue-multiple-licenses-form__description">
						{ translate( 'Or select any of our {{strong}}recommended bundles{{/strong}}:', {
							components: { strong: <strong /> },
						} ) }
					</p>
					<div className="issue-multiple-licenses-form__bottom">
						{ bundles &&
							bundles.map( ( productOption, i ) => (
								<LicenseProductCard
									key={ productOption.slug }
									product={ productOption }
									onSelectProduct={ onSelectProduct }
									isSelected={ productOption.slug === product }
									tabIndex={ 100 + i }
								/>
							) ) }
					</div>
				</>
			) }
		</div>
	);
}
