import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import FormRadio from 'calypso/components/forms/form-radio';
import Pagination from 'calypso/components/pagination';
import SearchCard from 'calypso/components/search-card';
import areLicenseKeysAssignableToMultisite from 'calypso/jetpack-cloud/sections/partner-portal/lib/are-license-keys-assignable-to-multisite';
import isWooCommerceProduct from 'calypso/jetpack-cloud/sections/partner-portal/lib/is-woocommerce-product';
import { a4aPurchasesBasePath } from 'calypso/lib/a8c-for-agencies/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resetSite, setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import AssignLicenseStepProgress from '../assign-license-step-progress';
import useAssignLicensesToSite from '../issue-license/hooks/use-assign-licenses-to-site';
import { SITE_CARDS_PER_PAGE } from './constants';

import './styles.scss';

type Props = {
	sites: Array< any >;
	currentPage: number;
	search: string;
};

function setPage( pageNumber: number ): void {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;

	page( addQueryArgs( queryParams, currentPath ) );
}

function setSearch( search: string ): void {
	const queryParams = { search, page: 1 };
	const currentPath = window.location.pathname + window.location.search;

	page( addQueryArgs( queryParams, currentPath ) );
}

function paginate( arr: Array< any >, currentPage: number ): Array< any > {
	return (
		arr
			// Slices sites list based on pagination settings
			.slice( SITE_CARDS_PER_PAGE * ( currentPage - 1 ), SITE_CARDS_PER_PAGE * currentPage )
	);
}

export default function AssignLicense( { sites, currentPage, search }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSite, setSelectedSite ] = useState( { ID: 0, domain: '' } );

	const { assignLicensesToSite, isReady } = useAssignLicensesToSite( selectedSite, {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { isPersistent: true } ) );
		},
	} );

	const licenseKeysArray = useMemo( () => {
		const products = getQueryArg( window.location.href, 'products' );
		if ( typeof products === 'string' ) {
			return products.split( ',' );
		}

		const licenseKey = getQueryArg( window.location.href, 'key' );
		if ( typeof licenseKey === 'string' ) {
			return [ licenseKey ];
		}

		return [];
	}, [] );

	// We need to filter out multisites if the licenses are not assignable to a multisite.
	let results = areLicenseKeysAssignableToMultisite( licenseKeysArray )
		? sites
		: sites.filter( ( site: any ) => ! site.is_multisite );

	if ( search ) {
		results = results.filter( ( site: any ) => site.domain.search( search ) !== -1 );
	}

	const showDownloadStep = licenseKeysArray.some( isWooCommerceProduct );

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-assign-license';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	const title = translate( 'Assign your license', 'Assign your licenses', {
		count: licenseKeysArray.length,
	} );

	const onClickAssignLater = useCallback( () => {
		if ( licenseKeysArray.length > 1 ) {
			page.redirect( a4aPurchasesBasePath( '/licenses' ) );
		}

		const licenseKey = licenseKeysArray[ 0 ];
		page.redirect( addQueryArgs( { highlight: licenseKey }, a4aPurchasesBasePath( '/licenses' ) ) );
	}, [ licenseKeysArray ] );

	const onClickAssignLicenses = useCallback( async () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_assign_multiple_licenses_submit', {
				products: licenseKeysArray.join( ',' ),
				selected_site: selectedSite?.ID,
			} )
		);

		const assignLicensesResult = await assignLicensesToSite( licenseKeysArray );

		dispatch( resetSite() );
		dispatch( setPurchasedLicense( assignLicensesResult ) );

		const goToDownloadStep = licenseKeysArray.some( ( licenseKey ) =>
			isWooCommerceProduct( licenseKey )
		);

		if ( goToDownloadStep ) {
			return page.redirect(
				addQueryArgs(
					{ products: licenseKeysArray.join( ',' ), attachedSiteId: selectedSite?.ID },
					a4aPurchasesBasePath( '/download-products' )
				)
			);
		}

		const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
		if ( fromDashboard ) {
			return page.redirect( '/sites' );
		}

		return page.redirect( a4aPurchasesBasePath( '/licenses' ) );
	}, [ assignLicensesToSite, dispatch, licenseKeysArray, selectedSite?.ID ] );

	return (
		<Layout
			className={ classNames( 'assign-license' ) }
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<AssignLicenseStepProgress
					currentStep="assignLicense"
					showDownloadStep={ showDownloadStep }
				/>

				<LayoutHeader>
					<Title>{ title } </Title>
					<Subtitle>
						{ translate( 'Select the website you would like to assign the license to.' ) }
					</Subtitle>

					<Actions>
						<div className="assign-license__controls">
							<Button
								borderless
								onClick={ onClickAssignLater }
								disabled={ ! isReady }
								className="assign-license-form__assign-later"
							>
								{ translate( 'Assign later' ) }
							</Button>

							<Button
								primary
								className="assign-license__assign-now"
								disabled={ selectedSite?.ID === 0 }
								busy={ ! isReady }
								onClick={ onClickAssignLicenses }
							>
								{ translate( 'Assign %(numLicenses)d License', 'Assign %(numLicenses)d Licenses', {
									count: licenseKeysArray.length,
									args: {
										numLicenses: licenseKeysArray.length,
									},
								} ) }
							</Button>
						</div>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<SearchCard
					className="assign-license__search-field"
					placeHolder={ translate( 'Search for website URL right here' ) }
					onSearch={ ( query: any ) => setSearch( query ) }
				/>

				<div className="assign-license__sites-list">
					{ paginate( results, currentPage ).map( ( site: any ) => {
						if ( -1 !== site.domain.search( search ) || null === search ) {
							return (
								<Card key={ site.ID } onClick={ () => setSelectedSite( site ) }>
									<FormRadio
										className="assign-license-form__site-card-radio"
										label={ site.domain }
										name="site_select"
										disabled={ ! isReady }
										checked={ selectedSite?.ID === site.ID }
									/>
								</Card>
							);
						}
					} ) }
				</div>

				<Pagination
					className="assign-license__pagination"
					page={ currentPage }
					perPage={ SITE_CARDS_PER_PAGE }
					total={ results.length }
					pageClick={ ( page: number ) => setPage( page ) }
				/>
			</LayoutBody>
		</Layout>
	);
}
