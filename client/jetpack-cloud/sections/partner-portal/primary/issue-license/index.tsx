import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationTabs as NavigationTabs,
} from 'calypso/jetpack-cloud/components/layout/nav';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import PartnerPortalSidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AssignLicenseStepProgress from '../../assign-license-step-progress';
import IssueLicenseContext from './context';
import { useProductBundleSize } from './hooks/use-product-bundle-size';
import useSubmitForm from './hooks/use-submit-form';
import LicensesForm from './licenses-form';
import ReviewLicenses from './review-licenses';
import TotalCost from './total-cost';
import type { SelectedLicenseProp } from './types';
import type { AssignLicenceProps } from '../../types';

import './style.scss';

export default function IssueLicense( { selectedSite, suggestedProduct }: AssignLicenceProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedSize, setSelectedSize, availableSizes, fetchingAvailableSizes } =
		useProductBundleSize();

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

	const [ selectedLicenses, setSelectedLicenses ] = useState< SelectedLicenseProp[] >( [] );
	const [ showReviewLicenses, setShowReviewLicenses ] = useState< boolean >( false );

	const selectedLicenseCount = selectedLicenses
		.map( ( license ) => license.quantity )
		.reduce( ( a, b ) => a + b, 0 );

	const onShowReviewLicensesModal = useCallback( () => {
		setShowReviewLicenses( true );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_issue_license_review_licenses_show', {
				total_licenses: selectedLicenseCount,
				items: selectedLicenses
					?.map( ( license ) => `${ license.slug } x ${ license.quantity }` )
					.join( ',' ),
			} )
		);
	}, [ dispatch, selectedLicenseCount, selectedLicenses ] );

	const onDismissReviewLicensesModal = useCallback( () => {
		setShowReviewLicenses( false );
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_issue_license_review_licenses_dimiss' ) );
	}, [ dispatch ] );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedLicenses.length > 0;

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

	// If URL params are present, use them to open the review licenses modal directly.
	useEffect( () => {
		if ( getQueryArg( window.location.href, 'source' ) === 'manage-pricing-page' ) {
			getGroupedLicenses();
			setShowReviewLicenses( true );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_manage_pricing_issue_license_review_licenses_show', {
					total_licenses: getQueryArg( window.location.href, 'bundle_size' ),
					product: getQueryArg( window.location.href, 'products' ),
				} )
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] ); // Intentionally leaving the array empty and disabling the eslint warning, as we want this to run only once.

	const currentStep = showReviewLicenses ? 'reviewLicense' : 'issueLicense';

	const selectedText =
		selectedSize === 1
			? translate( 'Single license' )
			: ( translate( '%(size)d licenses', { args: { size: selectedSize } } ) as string );

	const selectedCount = selectedLicenses.filter( ( license ) => license.quantity === selectedSize )
		?.length;

	const navItems = availableSizes.map( ( size ) => {
		const count = selectedLicenses.filter( ( license ) => license.quantity === size ).length;
		return {
			label:
				size === 1
					? translate( 'Single license' )
					: ( translate( '%(size)d licenses', {
							args: { size },
					  } ) as string ),
			selected: selectedSize === size,
			onClick: () => {
				setSelectedSize( size );
				dispatch(
					recordTracksEvent( 'calypso_jetpack_agency_issue_license_bundle_tab_click', {
						bundle_size: size,
					} )
				);
			},
			...( count && { count } ),
		};
	} );

	const selectedItemProps = {
		selectedText,
		...( selectedCount && { selectedCount } ),
	};

	const showBundle = ! selectedSite && availableSizes.length > 1;

	useEffect( () => {
		if ( ! fetchingAvailableSizes ) {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_agency_issue_license_visit', {
					bundle_size: selectedSize,
				} )
			);
		}
	}, [ dispatch, fetchingAvailableSizes, selectedSize ] );

	const subtitle = useMemo( () => {
		if ( selectedSite?.domain ) {
			return translate(
				'Select the Jetpack products you would like to add to {{strong}}%(selectedSiteDomain)s{{/strong}}:',
				{
					args: { selectedSiteDomain: selectedSite.domain },
					components: { strong: <strong /> },
				}
			);
		}

		return showBundle
			? translate( 'Select single product licenses or save when you issue in bulk' )
			: translate( 'Select the Jetpack products you would like to issue a new license for:' );
	}, [ selectedSite?.domain, showBundle, translate ] );

	const { isReady, submitForm } = useSubmitForm( selectedSite, suggestedProductSlugs );

	return (
		<>
			<Layout
				className={ clsx( 'issue-license-v2', { 'without-bundle': ! showBundle } ) }
				title={ translate( 'Issue a new License' ) }
				wide
				withBorder
				sidebarNavigation={ <PartnerPortalSidebarNavigation /> }
			>
				<LayoutTop>
					<AssignLicenseStepProgress
						currentStep={ currentStep }
						selectedSite={ selectedSite }
						isBundleLicensing
					/>

					<LayoutHeader showStickyContent={ showStickyContent }>
						<Title>{ translate( 'Issue product licenses' ) } </Title>
						<Subtitle>{ subtitle }</Subtitle>
						{ selectedLicenses.length > 0 && (
							<Actions>
								<div className="issue-license-v2__controls">
									<div className="issue-license-v2__actions">
										<TotalCost selectedLicenses={ selectedLicenses } />
										<Button
											primary
											className="issue-license-v2__select-license"
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

					{ showBundle && (
						<LayoutNavigation { ...selectedItemProps }>
							<NavigationTabs { ...selectedItemProps } items={ navItems } />
						</LayoutNavigation>
					) }
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
