import { Button, Card } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import FormRadio from 'calypso/components/forms/form-radio';
import SearchCard from 'calypso/components/search-card';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, infoNotice } from 'calypso/state/notices/actions';
import useAttachLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-attach-license-mutation';
import './style.scss';

export default function AttachLicenseForm( { sites } ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ filter, setFilter ] = useState( false );
	const [ selectedSite, setSelectedSite ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const licenseKey = getQueryArg( window.location.href, 'key' ) as string;
	const onSelectSite = ( site: any ) => setSelectedSite( site );

	const siteCards = sites.map( ( site: any ) => {
		if ( -1 !== site.domain.search( filter ) || false === filter ) {
			return (
				<Card key={ site.ID } className="attach-license-form__site-card">
					<FormRadio
						className="attach-license-form__site-card-radio"
						label=""
						name="site_select"
						onClick={ () => onSelectSite( site.ID ) }
					/>
					{ site.domain }
				</Card>
			);
		}
	} );

	const onSearch = ( query: any ) => setFilter( query );

	const attachLicense = useAttachLicenseMutation( {
		onSuccess: ( licenseKey: any ) => {
			setIsSubmitting( false );
			page.redirect( addQueryArgs( { highlight: licenseKey }, '/partner-portal/licenses' ) );
		},
		onError: ( error: Error ) => {
			setIsSubmitting( false );
			dispatch( errorNotice( error.message ) );
		},
	} );

	const onAttachLicense = useCallback( () => {
		setIsSubmitting( true );
		dispatch( infoNotice( translate( 'Attaching license…' ) ) );
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_attach_license_submit', {
				licenseKey,
				selectedSite,
			} )
		);
		attachLicense.mutate( { licenseKey, selectedSite } );
	}, [ dispatch, licenseKey, selectedSite, attachLicense.mutate ] );

	return (
		<div className="attach-license-form">
			<div className="attach-license-form__top">
				<p className="attach-license-form__description">
					{ translate(
						'Select the website that you would like to apply the license to. You can also attach it later.'
					) }
				</p>
				<div className="attach-license-form__controls">
					<Button primary onClick={ onAttachLicense } disabled={ isSubmitting }>
						{ translate( 'Attach to website' ) }
					</Button>
				</div>
			</div>

			<SearchCard
				className="attach-license-form__search-field"
				placeHolder={ translate( 'Search for website URL right here' ) }
				onSearch={ onSearch }
			/>

			{ siteCards }
		</div>
	);
}
