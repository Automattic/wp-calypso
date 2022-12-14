import { StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { debounce } from 'lodash';
import React, { FormEvent, useEffect, useMemo } from 'react';
import { DomainSuggestion } from 'calypso/../packages/data-stores/src';
import { setDomainCartItem } from 'calypso/../packages/data-stores/src/onboard/actions';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import wpcom from 'calypso/lib/wp';
import { tip } from 'calypso/signup/icons';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import { getUrlInfo } from '../launchpad/helper';
import type { Step } from '../../types';
import './styles.scss';

const FreeSetup: Step = function FreeSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const formText = {
		titlePlaceholder: __( 'My Website' ),
		titleMissing: __( `Oops. Looks like your website doesn't have a name yet.` ),
		taglinePlaceholder: __( 'Add a short description here' ),
		iconPlaceholder: __( 'Upload a profile image' ),
	};

	const [ invalidSiteTitle, setInvalidSiteTitle ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ generatedDomainSuggestion, setGeneratedDomainSuggestion ] =
		React.useState< DomainSuggestion | null >();
	const [ generatedTopLevelDomain, setGeneratedTopLevelDomain ] = React.useState< string >( '' );
	const [ generatedSiteName, setGeneratedSiteName ] = React.useState< string >( '' );
	const [ showGeneratedDomainFormField, setShowGeneratedDomainFormField ] =
		React.useState< boolean >( false );
	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();

	const generateNewRandomDomain = async ( siteTitle: string ) => {
		await wpcom.req
			.get(
				{
					path: '/domains/suggestions',
					apiNamespace: 'rest/v1.1',
				},
				{
					managed_subdomains: 'wordpress.com',
					managed_subdomain_options:
						'exact_match,random_name,random_name_format=adjective,suffix=query',
					managed_subdomain_quantity: 1,
					quantity: 1,
					http_envelope: 1,
					query: siteTitle,
				}
			)
			.then( ( result: DomainSuggestion[] ) => {
				if ( result[ 0 ] ) {
					setGeneratedDomainSuggestion( result[ 0 ] );
					const domainCartItem = domainRegistration( {
						domain: result[ 0 ].domain_name,
						productSlug: '',
					} );
					setDomainCartItem( domainCartItem );
					setShowGeneratedDomainFormField( true );
				} else {
					setGeneratedDomainSuggestion( null );
					setDomainCartItem( undefined );
				}
			} )
			.catch( () => {
				// TODO: add error message
				setGeneratedDomainSuggestion( null );
				setDomainCartItem( undefined );
			} );
	};

	const debounceGenerateRandomDomainAPI = useMemo(
		() => debounce( generateNewRandomDomain, 1000 ),
		[]
	);

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setInvalidSiteTitle( ! siteTitle.trim().length );

		setSiteDescription( tagline );
		setSiteTitle( siteTitle );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// TODO: communicate the error to the user
			}
		}

		if ( siteTitle.trim().length && generatedDomainSuggestion?.domain_name ) {
			submit?.( { siteTitle, tagline, siteSlug: generatedDomainSuggestion.domain_name } );
		}
	};

	const domainGeneratorFormField = () => {
		if ( ! showGeneratedDomainFormField ) {
			return undefined;
		}
		return (
			<FormFieldset className="setup-form-field-set-domain-name">
				<FormLabel htmlFor="setup-form-domain-name">{ __( 'Site address' ) }</FormLabel>
				<div className="setup-form-domain-name__url-box">
					<div className="setup-form-domain-name__url-box-domain">
						<div className="setup-form-domain-name__url-box-domain-text">
							<span className="setup-form-domain-name__url-box-site-name">
								{ generatedSiteName }
							</span>
							<span className="setup-form-domain-name__url-box-top-level-domain">
								{ generatedTopLevelDomain }
							</span>
						</div>
					</div>
				</div>
				<FormSettingExplanation>
					<Icon className="setup-form-domain-name-explaination" icon={ tip } size={ 20 } />
					{ __( 'You can customize your domain later' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	};

	const handleBackButton = () => {
		return window.location.assign( '/setup/free/intro' );
	};

	useEffect( () => {
		const { siteTitle, siteDescription, siteLogo } = state;
		setTagline( siteDescription );
		setComponentSiteTitle( siteTitle );

		if ( siteLogo ) {
			const file = new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' );
			setSelectedFile( file );
		}
	}, [ state ] );

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		setComponentSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site ] );

	useEffect( () => {
		if ( siteTitle.trim().length > 0 ) {
			// Debounce for random domain generation API while user is typing site title
			debounceGenerateRandomDomainAPI( siteTitle );
		} else {
			debounceGenerateRandomDomainAPI.cancel();
		}
	}, [ siteTitle, showGeneratedDomainFormField, debounceGenerateRandomDomainAPI ] );

	// Splits generated domain suggestion for styling purposes
	useEffect( () => {
		if ( generatedDomainSuggestion ) {
			const [ siteName, topLevelDomain ] = getUrlInfo( generatedDomainSuggestion?.domain_name );
			topLevelDomain && setGeneratedTopLevelDomain( topLevelDomain );
			siteName && setGeneratedSiteName( siteName );
		}
	}, [ generatedDomainSuggestion ] );

	return (
		<StepContainer
			stepName="free-setup"
			isWideLayout={ true }
			hideBack={ false }
			flowName="free"
			goBack={ handleBackButton }
			showJetpackPowered={ true }
			formattedHeader={
				<FormattedHeader
					id="free-setup-header"
					headerText={ createInterpolateElement( __( 'Personalize your site' ), {
						br: <br />,
					} ) }
					align="center"
				/>
			}
			stepContent={
				<SetupForm
					site={ site }
					siteTitle={ siteTitle }
					setComponentSiteTitle={ setComponentSiteTitle }
					invalidSiteTitle={ invalidSiteTitle }
					setInvalidSiteTitle={ setInvalidSiteTitle }
					tagline={ tagline }
					setTagline={ setTagline }
					selectedFile={ selectedFile }
					setSelectedFile={ setSelectedFile }
					setBase64Image={ setBase64Image }
					handleSubmit={ handleSubmit }
					translatedText={ formText }
					children={ domainGeneratorFormField() }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default FreeSetup;
