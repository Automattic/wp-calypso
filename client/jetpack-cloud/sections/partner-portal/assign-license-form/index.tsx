import { Button, Card } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import FormRadio from 'calypso/components/forms/form-radio';
import Pagination from 'calypso/components/pagination';
import SearchCard from 'calypso/components/search-card';
import { SITE_CARDS_PER_PAGE } from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-form/constants';
import { useAssignLicensesToSite } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { addQueryArgs } from 'calypso/lib/url';
import { areLicenseKeysAssignableToMultisite } from '../utils';
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

export default function AssignLicenseForm( {
	sites,
	currentPage,
	search,
}: {
	sites: Array< any >;
	currentPage: number;
	search: string;
} ) {
	const translate = useTranslate();
	const [ selectedSite, setSelectedSite ] = useState( { ID: 0, domain: '' } );
	const licenseKey = getQueryArg( window.location.href, 'key' ) as string;
	const products = getQueryArg( window.location.href, 'products' ) as string;
	const licenseKeysArray = products !== undefined ? products.split( ',' ) : [ licenseKey ];
	const onSelectSite = ( site: any ) => {
		setSelectedSite( site );
	};
	const [ assignLicensesToSite, isLoading ] = useAssignLicensesToSite( selectedSite );

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
						disabled={ isLoading }
						checked={ selectedSite?.ID === site.ID }
					/>
				</Card>
			);
		}
	} );

	const onAssignLater = () => {
		if ( licenseKeysArray.length > 1 ) {
			page.redirect( '/partner-portal/licenses' );
		}
		page.redirect( addQueryArgs( { highlight: licenseKey }, '/partner-portal/licenses' ) );
	};

	if ( ! results.length ) {
		return (
			<div className="assign-license-form__empty-state">
				<p>
					{ translate(
						'It looks like you don’t have any connected Jetpack sites you can apply this license to.'
					) }
				</p>
				<Button primary onClick={ onAssignLater }>
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
						onClick={ onAssignLater }
						disabled={ isLoading }
						className="assign-license-form__assign-later"
					>
						{ translate( 'Assign later' ) }
					</Button>
					<Button
						primary
						className="assign-license-form__assign-now"
						disabled={ selectedSite?.ID === 0 }
						busy={ isLoading }
						onClick={ () => assignLicensesToSite( licenseKeysArray ) }
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
