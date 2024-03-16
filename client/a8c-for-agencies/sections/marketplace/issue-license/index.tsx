// FIXME: Lets decide later if we need to move the calypso/jetpack-cloud imports to a shared common folder.
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { getQueryArg } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useProductBundleSize } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-product-bundle-size';
import ReviewLicenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/review-licenses';
import TotalCost from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/total-cost';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSites from 'calypso/state/selectors/get-sites';
import IssueLicenseContext from './context';
import LicensesForm from './licenses-form';
import useSubmitForm from './licenses-form/hooks/use-submit-form';
import type { SelectedLicenseProp } from './types';
import type { AssignLicenseProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

export default function IssueLicense( { siteId, suggestedProduct }: AssignLicenseProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedLicenses, setSelectedLicenses ] = useState< SelectedLicenseProp[] >( [] );
	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );
	const [ showReviewLicenses, setShowReviewLicenses ] = useState< boolean >( false );

	const selectedLicenseCount = selectedLicenses
		.map( ( license ) => license.quantity )
		.reduce( ( a, b ) => a + b, 0 );

	const { selectedSize } = useProductBundleSize( true );

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

	const { isReady, submitForm } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const onShowReviewLicensesModal = useCallback( () => {
		setShowReviewLicenses( true );
		dispatch(
			recordTracksEvent( 'calypso_a4a_issue_license_review_licenses_show', {
				total_licenses: selectedLicenseCount,
				items: selectedLicenses
					?.map( ( license ) => `${ license.slug } x ${ license.quantity }` )
					.join( ',' ),
			} )
		);
	}, [ dispatch, selectedLicenseCount, selectedLicenses ] );

	const onDismissReviewLicensesModal = useCallback( () => {
		setShowReviewLicenses( false );
		dispatch( recordTracksEvent( 'calypso_a4a_issue_license_review_licenses_dimiss' ) );
	}, [ dispatch ] );

	const sites = useSelector( getSites );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedLicenses.length > 0;

	useEffect( () => {
		if ( siteId && sites.length > 0 ) {
			const site = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
			setSelectedSite( site );
		}
	}, [ siteId, sites ] );

	// Group licenses by slug and sort them by quantity
	const getGroupedLicenses = useCallback( () => {
		return Object.values(
			selectedLicenses.reduce(
				( acc: Record< string, SelectedLicenseProp[] >, license ) => (
					( acc[ license.slug ] = ( acc[ license.slug ] || [] ).concat( license ) ), acc
				),
				{}
			)
		)
			.map( ( group ) => group.sort( ( a, b ) => a.quantity - b.quantity ) )
			.flat();
	}, [ selectedLicenses ] );

	return (
		<>
			<Layout
				className={ classNames( 'issue-license' ) }
				title={ translate( 'Product Marketplace' ) }
				wide
				withBorder
				sidebarNavigation={ <MobileSidebarNavigation /> }
			>
				<LayoutTop>
					<LayoutHeader showStickyContent={ showStickyContent }>
						<Title>{ translate( 'Marketplace' ) } </Title>
						{ selectedLicenses.length > 0 && (
							<Actions>
								<div className="issue-license__controls">
									<div className="issue-license__actions">
										<TotalCost selectedLicenses={ selectedLicenses } />
										<Button
											primary
											className="issue-license__select-license"
											busy={ ! isReady }
											onClick={ onShowReviewLicensesModal }
										>
											{ translate(
												'Review %(numLicenses)d license',
												'Review %(numLicenses)d licenses',
												{
													context: 'button label',
													count: selectedLicenseCount,
													args: {
														numLicenses: selectedLicenseCount,
													},
												}
											) }
										</Button>
									</div>
								</div>
							</Actions>
						) }
					</LayoutHeader>
				</LayoutTop>

				<LayoutBody>
					<IssueLicenseContext.Provider value={ { setSelectedLicenses, selectedLicenses } }>
						<LicensesForm
							selectedSite={ selectedSite }
							suggestedProduct={ suggestedProduct }
							quantity={ selectedSize }
						/>
					</IssueLicenseContext.Provider>
				</LayoutBody>
			</Layout>
			{ showReviewLicenses && (
				<ReviewLicenses
					onClose={ onDismissReviewLicensesModal }
					selectedLicenses={ getGroupedLicenses() }
					selectedSite={ selectedSite }
					isFormReady={ isReady }
					submitForm={ submitForm }
				/>
			) }
		</>
	);
}
