/**
 * External Dependencies
 */
import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import classNames from 'classnames';
import { includes, pickBy, filter } from 'lodash';
import { useSelector } from 'react-redux';
/**
 * Internal Dependencies
 */
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import TokenField from 'calypso/components/token-field';
import wpcom from 'calypso/lib/wp';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import wrapSettingsForm from '../wrap-settings-form';

const P2PreapprovedDomainsForm = ( {
	fields,
	handleSubmitForm,
	isRequestingSettings,
	isSavingSettings,
	recordTracksEvent,
	siteId,
	translate,
	updateFields,
} ) => {
	const SETTING_KEY_PREAPPROVED_DOMAINS = 'p2_preapproved_domains';

	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const isP2Hub = useSelector( ( state ) => isSiteP2Hub( state, siteId ) );

	const [ isToggledOn, setIsToggledOn ] = useState( false );
	const [ isValidating, setIsValidating ] = useState( false );
	const [ validTokens, setValidTokens ] = useState( [] );
	const [ invalidTokens, setInvalidTokens ] = useState( {} );
	const [ error, setError ] = useState( {} );

	useEffect( () => {
		if ( ! fields?.p2_preapproved_domains ) {
			return;
		}

		// Domains should always be toggled on if text field is not empty.
		// The reverse is not true -- it can be toggled on while empty.
		if ( fields.p2_preapproved_domains.length > 0 ) {
			setIsToggledOn( true );
		}
	}, [ fields ] );

	if ( ! isWPForTeamsSite || ! isP2Hub ) {
		return <></>;
	}

	const getFormField = () => {
		return fields?.p2_preapproved_domains || [];
	};

	const setFormField = ( domains ) => {
		updateFields( { [ SETTING_KEY_PREAPPROVED_DOMAINS ]: domains } );
	};

	const handleSubmitButtonClick = ( event ) => {
		if ( ! isValidating ) {
			handleSubmitForm( event );
		}
	};

	const handleDomainsToggle = () => {
		// Clear field if toggling off. If toggling on, it should have
		// been empty to start with.
		setFormField( [] );

		setIsToggledOn( ! isToggledOn );
	};

	const refreshValidation = ( valid = [], invalid = {} ) => {
		setInvalidTokens( invalid );
		setValidTokens( valid );

		const invalidTokenKeys = Object.keys( invalidTokens );
		setError( error || ( invalidTokenKeys.length > 0 && invalidTokenKeys[ 0 ] ) );
	};

	const validateTokens = async ( tokens ) => {
		setIsValidating( true );

		if ( tokens.length < 1 ) {
			refreshValidation( [], {} );
			return;
		}

		// Prior to sending off a validation API request,
		// first quickly remove old, now-deleted tokens from validation lists.
		const updatedInvalidTokens = pickBy( invalidTokens, ( _, key ) => {
			return tokens.includes( key );
		} );
		setInvalidTokens( updatedInvalidTokens );
		setError( tokens.includes( error ) && error );

		const updatedValidTokens = filter( validTokens, ( token ) => {
			return tokens.includes( token );
		} );
		setValidTokens( updatedValidTokens );

		try {
			const { success, errors } = await wpcom.req.get(
				{
					path: `/p2/hub-settings/domains/validate`,
					apiNamespace: 'wpcom/v2',
				},
				{ domains: tokens }
			);

			refreshValidation( success, errors );

			recordTracksEvent( 'calypso_p2_settings_validate_preapproved_domains_valid' );
		} catch ( e ) {
			recordTracksEvent( 'calypso_p2_settings_validate_preapproved_domains_invalid' );
		} finally {
			setIsValidating( false );
		}
	};

	const normalizeTokens = ( rawTokens ) => {
		const tokens = rawTokens.map( ( value ) => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		return tokens;
	};

	const onTokensChange = ( rawTokens ) => {
		const tokens = normalizeTokens( rawTokens );
		setFormField( tokens );
		validateTokens( tokens );
	};

	const getTokensWithStatus = () => {
		const rawTokens = getFormField();

		const tokens = rawTokens.map( ( token ) => {
			if ( invalidTokens && invalidTokens[ token ] ) {
				return {
					status: 'error',
					value: token,
					tooltip: invalidTokens[ token ],
					onMouseEnter: () => setError( token ),
				};
			}

			if ( ! includes( validTokens, token ) ) {
				return {
					value: token,
					status: 'validating',
				};
			}

			return token;
		} );

		return tokens;
	};

	return (
		<div
			className={ classNames( 'p2-preapproved-domains', {
				'is-loading': isRequestingSettings,
			} ) }
		>
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }

			<SettingsSectionHeader
				disabled={
					isRequestingSettings || isSavingSettings || Object.keys( invalidTokens ).length > 0
				}
				isSaving={ isSavingSettings }
				onButtonClick={ handleSubmitButtonClick }
				showButton
				title={ translate( 'Joining this workspace' ) }
			/>
			<Card>
				<form>
					<div className="preapproved-domains__form">
						<FormFieldset>
							<ToggleControl
								checked={ isToggledOn }
								disabled={ isRequestingSettings || isSavingSettings }
								onChange={ handleDomainsToggle }
								label={ translate(
									'Allow people with an email address from specified domains to join this workspace.'
								) }
							></ToggleControl>
							{ isToggledOn && (
								<>
									<FormLabel htmlFor="blogname">{ translate( 'Approved domains' ) }</FormLabel>
									<TokenField
										name="p2_preapproved_domains"
										id="p2-preapproved-domains"
										isBorderless
										tokenizeOnSpace
										autoCapitalize="none"
										autoComplete="off"
										autoCorrect="off"
										spellCheck="false"
										maxLength={ 5 }
										value={ getTokensWithStatus() }
										onChange={ onTokensChange }
										disabled={ isRequestingSettings }
									/>
									<FormSettingExplanation>
										{ translate(
											'If you enter %(emailDomain)s, anybody using %(emailDomain)s email will be able to join this workspace. To add multiple domains, separate them with a comma.',
											{
												args: {
													emailDomain: 'automattic.com',
												},
											}
										) }
									</FormSettingExplanation>
								</>
							) }
						</FormFieldset>
					</div>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = ( settings ) => {
	const defaultSettings = {
		p2_preapproved_domains: '',
	};

	if ( ! settings ) {
		return defaultSettings;
	}

	const formSettings = {
		p2_preapproved_domains: settings.p2_preapproved_domains,
	};

	return formSettings;
};

export default wrapSettingsForm( getFormSettings )( P2PreapprovedDomainsForm );
