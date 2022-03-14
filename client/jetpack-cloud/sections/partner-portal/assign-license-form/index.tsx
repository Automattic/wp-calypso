import { Button, Card } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import FormRadio from 'calypso/components/forms/form-radio';
import Pagination from 'calypso/components/pagination';
import SearchCard from 'calypso/components/search-card';
import { SITE_CARDS_PER_PAGE } from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-form/constants';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
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
} ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedSite, setSelectedSite ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const licenseKey = getQueryArg( window.location.href, 'key' ) as string;
	const onSelectSite = ( site: any ) => setSelectedSite( site );

	let results = sites;

	if ( search ) {
		results = results.filter( ( site: any ) => site.domain.search( search ) !== -1 );
	}

	const siteCards = paginate( results, currentPage ).map( ( site: any ) => {
		if ( -1 !== site.domain.search( search ) || null === search ) {
			return (
				<Card key={ site.ID } className="assign-license-form__site-card">
					<FormRadio
						className="assign-license-form__site-card-radio"
						label={ site.domain }
						name="site_select"
						disabled={ isSubmitting }
						onClick={ () => onSelectSite( site.ID ) }
					/>
				</Card>
			);
		}
	} );

	const assignLicense = useAssignLicenseMutation( {
		onSuccess: ( license: any ) => {
			setIsSubmitting( false );
			page.redirect(
				addQueryArgs( { highlight: license.license_key }, '/partner-portal/licenses' )
			);
		},
		onError: ( error: Error ) => {
			setIsSubmitting( false );
			dispatch( errorNotice( error.message ) );
		},
	} );

	const onAssignLicense = useCallback( () => {
		setIsSubmitting( true );
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_assign_license_submit', {
				license_key: licenseKey,
				selected_site: selectedSite,
			} )
		);
		assignLicense.mutate( { licenseKey, selectedSite } );
	}, [ dispatch, licenseKey, selectedSite, assignLicense.mutate ] );

	const onAssignLater = () =>
		page.redirect( addQueryArgs( { highlight: licenseKey }, '/partner-portal/licenses' ) );

	return (
		<div className="assign-license-form">
			<div className="assign-license-form__top">
				<p className="assign-license-form__description">
					{ translate( 'Select the website you would like to assign the license to.' ) }
				</p>
				<div className="assign-license-form__controls">
					<Button
						borderless
						onClick={ onAssignLater }
						disabled={ isSubmitting }
						className="assign-license-form__assign-later"
					>
						{ translate( 'Assign later' ) }
					</Button>
					<Button
						primary
						className="assign-license-form__assign-now"
						disabled={ ! selectedSite }
						busy={ isSubmitting }
						onClick={ onAssignLicense }
					>
						{ translate( 'Assign to website' ) }
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
