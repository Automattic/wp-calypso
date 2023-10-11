import { Button, Card } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import FormRadio from 'calypso/components/forms/form-radio';
import Pagination from 'calypso/components/pagination';
import SearchCard from 'calypso/components/search-card';
import { SITE_CARDS_PER_PAGE } from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-form/constants';
import { useAssignLicensesToSite } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { areLicenseKeysAssignableToMultisite, isWooCommerceProduct } from '../lib';
import './style.scss';

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

const getLicenseKeysFromUrl = () => {
	const products = getQueryArg( window.location.href, 'products' );
	if ( typeof products === 'string' ) {
		return products.split( ',' );
	}

	const licenseKey = getQueryArg( window.location.href, 'key' );
	if ( typeof licenseKey === 'string' ) {
		return [ licenseKey ];
	}

	return [];
};

export default function AssignLicenseForm( {
	sites,
	currentPage,
	search,
}: {
	sites: Array< any >;
	currentPage: number;
	search: string;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ selectedSite, setSelectedSite ] = useState( { ID: 0, domain: '' } );
	const onSelectSite = ( site: any ) => {
		setSelectedSite( site );
	};

	const { assignLicensesToSite, isReady } = useAssignLicensesToSite( selectedSite, {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { isPersistent: true } ) );
		},
	} );

	const licenseKeysArray = getLicenseKeysFromUrl();

	// We need to filter out multisites if the licenses are not assignable to a multisite.
	let results = areLicenseKeysAssignableToMultisite( licenseKeysArray )
		? sites
		: sites.filter( ( site: any ) => ! site.is_multisite );

	if ( search ) {
		results = results.filter( ( site: any ) => site.domain.search( search ) !== -1 );
	}

	const siteCards = paginate( results, currentPage ).map( ( site: any ) => {
		if ( -1 !== site.domain.search( search ) || null === search ) {
			return (
				<Card
					key={ site.ID }
					className="assign-license-form__site-card"
					onClick={ () => onSelectSite( site ) }
				>
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
	} );

	const onClickAssignLater = useCallback( () => {
		if ( licenseKeysArray.length > 1 ) {
			page.redirect( '/partner-portal/licenses' );
		}

		const licenseKey = licenseKeysArray[ 0 ];
		page.redirect( addQueryArgs( { highlight: licenseKey }, '/partner-portal/licenses' ) );
	}, [ licenseKeysArray ] );

	const onClickAssignLicenses = useCallback( async () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_assign_multiple_licenses_submit', {
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
					partnerPortalBasePath( '/download-products' )
				)
			);
		}

		const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
		if ( fromDashboard ) {
			return page.redirect( '/dashboard' );
		}

		return page.redirect( partnerPortalBasePath( '/licenses' ) );
	}, [ assignLicensesToSite, dispatch, licenseKeysArray, selectedSite?.ID ] );

	if ( ! results.length && search === '' ) {
		return (
			<div className="assign-license-form__empty-state">
				<p>
					{ translate(
						'It looks like you don’t have any connected Jetpack sites you can apply this license to.'
					) }
				</p>
				<Button primary onClick={ onClickAssignLater }>
					{ translate( 'Assign license later', 'Assign licenses later', {
						count: licenseKeysArray.length,
					} ) }
				</Button>
				<Button
					target="_blank"
					href="https://jetpack.com/support/jetpack-agency-licensing-portal-instructions/add-sites-agency-portal-dashboard/"
				>
					{ translate( 'Learn how to add a site' ) }
				</Button>
			</div>
		);
	}

	return (
		<div className="assign-license-form">
			<div className="assign-license-form__top">
				<p className="assign-license-form__description">
					{ translate(
						'Select the website you would like to assign the license to.',
						'Select the website you would like to assign the licenses to.',
						{
							count: licenseKeysArray.length,
						}
					) }
				</p>
				<div className="assign-license-form__controls">
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
						className="assign-license-form__assign-now"
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
			</div>

			<SearchCard
				className="assign-license-form__search-field"
				placeHolder={ translate( 'Search for website URL right here' ) }
				onSearch={ ( query: any ) => setSearch( query ) }
			/>

			{ siteCards }

			<Pagination
				className="assign-license-form__pagination"
				page={ currentPage }
				perPage={ SITE_CARDS_PER_PAGE }
				total={ results.length }
				pageClick={ ( page: number ) => setPage( page ) }
			/>
		</div>
	);
}
