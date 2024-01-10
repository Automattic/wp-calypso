import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import {
	isRequestingSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
} from 'calypso/state/site-settings/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const HeaderCodeSettings = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ editedCode, setEditedCode ] = useState( '' );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const headCode = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_header_code' )
	);
	const isRequestingSettings = useSelector( ( state ) =>
		isRequestingSiteSettings( state, siteId )
	);
	const isSaveFailure = useSelector( ( state ) => getSiteSettingsSaveError( state, siteId ) );
	const isSaveSuccess = useSelector( ( state ) => isSiteSettingsSaveSuccessful( state, siteId ) );
	const isSavingSettings = useSelector( ( state ) => isSavingSiteSettings( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state, siteId ) );

	const saveSettings = () => {
		dispatch(
			saveSiteSettings( siteId, {
				jetpack_header_code: editedCode,
			} )
		);
	};

	const noticeOptions = {
		duration: 4000,
	};

	useEffect( () => {
		if ( isSaveSuccess ) {
			dispatch( successNotice( translate( 'Code updated successfully.' ), noticeOptions ) );
		} else if ( isSaveFailure ) {
			dispatch( errorNotice( translate( 'There was an error saving your code.' ), noticeOptions ) );
		}
	}, [ isSaveSuccess, isSaveFailure ] );

	useEffect( () => {
		if ( headCode ) {
			setEditedCode( headCode );
		}
	}, [ headCode ] );

	return (
		<Main className="header-code">
			<DocumentHead title={ translate( 'Header Code' ) } />
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			<NavigationHeader
				title={ translate( 'Header Code' ) }
				subtitle={ translate( 'Insert HTML meta tags and JavaScript code to your site.' ) }
			/>
			<HeaderCake backHref={ `/settings/general/${ siteSlug }` } isCompact>
				<h1>{ translate( 'Header Code' ) }</h1>
			</HeaderCake>
			<Card>
				<p className="header-code__text">
					{ translate(
						'The following code will be inserted within {{code}}<head>{{/code}} on your site. {{link}}Learn more{{/link}}.',
						{
							components: {
								code: <code />,
								link: <InlineSupportLink supportContext="insert-header-code" showIcon={ false } />,
							},
						}
					) }
				</p>

				<FormTextarea
					className="header-code__editor"
					disabled={ isRequestingSettings || isSavingSettings }
					value={ editedCode }
					onChange={ ( input ) => setEditedCode( input.target.value ) }
				/>
				<FormSettingExplanation className="header-code__warning">
					<Gridicon icon="info" size={ 18 } />
					<span>
						{ translate(
							"This code will be run for all your site's viewers. Please make sure that you understand any code and trust its source before adding it here."
						) }
					</span>
				</FormSettingExplanation>
				<div className="header-code__button">
					<Button
						disabled={ headCode === editedCode || ! editedCode || isRequestingSettings }
						primary
						busy={ isSavingSettings }
						onClick={ saveSettings }
					>
						{ translate( 'Save' ) }
					</Button>
				</div>
			</Card>
		</Main>
	);
};

export default HeaderCodeSettings;
