import { FEATURE_INSTALL_PLUGINS, getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button, Card, Gridicon } from '@automattic/components';
import { html } from '@codemirror/lang-html';
import CodeMirror from '@uiw/react-codemirror';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import {
	isRequestingSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
} from 'calypso/state/site-settings/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const HeaderCodeSettings = ( {
	errorMessage,
	hasPlanFeature,
	headCode,
	isAdmin,
	isJetpack,
	isRequestingSettings,
	isSaveFailure,
	isSaveSuccess,
	isSavingSettings,
	saveSettings,
	siteId,
	siteSlug,
	successMessage,
	translate,
} ) => {
	const [ htmlCode, setHtmlCode ] = useState( '' );

	useEffect( () => {
		if ( 'string' === typeof headCode && headCode.length ) {
			setHtmlCode( headCode );
		}

		// Necessary for if switching to a site without any code.
		if ( ! headCode ) {
			setHtmlCode( '' );
		}
	}, [ headCode, siteId ] );

	useEffect( () => {
		if ( isSaveSuccess ) {
			successMessage( translate( 'Code updated successfully!' ), {
				duration: 4000,
			} );
		} else if ( isSaveFailure && ! isSavingSettings ) {
			errorMessage( translate( 'There was an error saving your code.' ), {
				duration: 4000,
			} );
		}
	}, [ isSaveSuccess, isSavingSettings, isSaveFailure ] );

	const handleSaveSettings = () => {
		saveSettings( siteId, {
			jetpack_header_code: htmlCode,
		} );
	};

	const isSupported = isJetpack || hasPlanFeature;

	return (
		<Main className="header-code">
			<DocumentHead title={ translate( 'Header Code' ) } />
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			{ ! isAdmin && (
				<EmptyContent
					illustration={ illustration404 }
					title={ translate( 'You are not authorized to view this page' ) }
				/>
			) }

			{ isAdmin && (
				<>
					<NavigationHeader
						title={ translate( 'Header Code' ) }
						subtitle={ translate( 'Insert code within the Header element of your site.' ) }
					/>
					<HeaderCake backHref={ `/settings/general/${ siteSlug }` } isCompact>
						<h1>{ translate( 'Header Code' ) }</h1>
					</HeaderCake>
					<Card>
						<UpsellNudge
							plan={ PLAN_BUSINESS }
							title={ translate( 'Add custom code to your site with the %(planName)s plan.', {
								args: { planName: getPlan( PLAN_BUSINESS ).getTitle() },
							} ) }
							description={ translate(
								'Upgrade to insert JavaScript and HTML meta tags to your site.'
							) }
							showIcon
							forceDisplay={ ! isSupported }
						/>
						<p className="header-code__text">
							{ translate(
								'The following code will be inserted within {{code}}<head>{{/code}} on your site. {{link}}Learn more{{/link}}.',
								{
									components: {
										code: <code />,
										link: (
											<InlineSupportLink supportContext="insert-header-code" showIcon={ false } />
										),
									},
								}
							) }
						</p>
						<div
							className={ classNames( 'header-code__editor', {
								'is-loading': isRequestingSettings,
							} ) }
						>
							<CodeMirror
								value={ htmlCode }
								onChange={ ( value ) => setHtmlCode( value ) }
								height="235px"
								extensions={ [ html() ] }
							/>
						</div>
						<div className="header-code__warning">
							<Gridicon icon="info" size={ 18 } />
							<p className="header-code__warning-text">
								{ translate( "This code will be run for all your site's viewers." ) }{ ' ' }
								{ translate(
									'Please make sure that you understand any code and trust its source before adding it here.'
								) }
							</p>
						</div>
						<div className="header-code__button">
							<Button
								disabled={ headCode === htmlCode || ! isSupported || isRequestingSettings }
								primary
								busy={ isSavingSettings }
								onClick={ handleSaveSettings }
							>
								{ translate( 'Save' ) }
							</Button>
						</div>
					</Card>
				</>
			) }
		</Main>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			hasPlanFeature: siteHasFeature( state, siteId, FEATURE_INSTALL_PLUGINS ),
			headCode: getSiteSetting( state, siteId, 'jetpack_header_code' ),
			isAdmin: canCurrentUser( state, siteId, 'manage_options' ),
			isJetpack: isJetpackSite( state, siteId ),
			isRequestingSettings: isRequestingSiteSettings( state, siteId ),
			isSaveFailure: getSiteSettingsSaveError( state, siteId ),
			isSaveSuccess: isSiteSettingsSaveSuccessful( state, siteId ),
			isSavingSettings: isSavingSiteSettings( state, siteId ),
			siteId,
			siteSlug: getSelectedSiteSlug( state, siteId ),
		};
	},
	{ saveSettings: saveSiteSettings, successMessage: successNotice, errorMessage: errorNotice }
)( localize( HeaderCodeSettings ) );
