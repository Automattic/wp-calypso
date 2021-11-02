import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import debugModule from 'debug';
import { flowRight, includes, pickBy, filter } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import TokenField from 'calypso/components/token-field';
import wpcom from 'calypso/lib/wp';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import wrapSettingsForm from '../wrap-settings-form';

const debug = debugModule( 'calypso:my-sites:settings:p2-settings' );
export class P2GeneralSettingsForm extends Component {
	SETTING_KEY_PREAPPROVED_DOMAINS = 'p2_preapproved_domains';

	state = {
		isDomainsToggledOn: false,
		isValidating: false,
		success: [],
		errors: {},
		errorToDisplay: '',
	};

	static getDerivedStateFromProps( props, state ) {
		if ( ! props.fields || ! props.fields.p2_preapproved_domains ) {
			return null;
		}

		if ( state.isDomainsToggledOn === !! props.fields?.p2_preapproved_domains ) {
			return null;
		}

		// Domains should always be toggled on if text field is not empty.
		// The reverse is not true -- can be toggled on even if empty.
		if ( props.fields?.p2_preapproved_domains?.length > 0 ) {
			return { isDomainsToggledOn: true };
		}
	}

	handleSubmitForm = ( event ) => {
		if ( ! this.state.isValidating ) {
			this.props.handleSubmitForm( event );
		}
	};

	getPreapprovedDomains = () => {
		const { fields } = this.props;

		return fields?.p2_preapproved_domains || [];
	};

	setPreapprovedDomains = ( domains ) => {
		const { updateFields } = this.props;

		updateFields( { [ this.SETTING_KEY_PREAPPROVED_DOMAINS ]: domains } );
	};

	/**
	 * Handle toggle button action.
	 */
	handleDomainsToggle = () => {
		const { updateFields } = this.props;

		updateFields( { [ this.SETTING_KEY_PREAPPROVED_DOMAINS ]: [] } );

		this.setState( {
			isDomainsToggledOn: ! this.state.isDomainsToggledOn,
		} );
	};

	refreshDomainsValidation = ( success = [], errors = {} ) => {
		const errorsKeys = Object.keys( errors );
		const errorToDisplay =
			this.state.errorToDisplay || ( errorsKeys.length > 0 && errorsKeys[ 0 ] );

		this.setState( {
			errorToDisplay,
			errors,
			success,
		} );
	};

	async validateDomains( domains ) {
		this.setState( { isValidating: true } );

		if ( domains.length < 1 ) {
			this.refreshDomainsValidation( [], {} );
			return;
		}

		try {
			const { success, errors } = await wpcom.req.get(
				{
					path: `/p2/hub-settings/domains/validate`,
					apiNamespace: 'wpcom/v2',
				},
				{ domains }
			);

			this.refreshDomainsValidation( success, errors );

			this.props.recordTracksEvent( 'calypso_p2_settings_validate_preapproved_domains_success' );
		} catch ( error ) {
			this.props.recordTracksEvent( 'calypso_p2_settings_validate_preapproved_domains_failed' );
		} finally {
			this.setState( { isValidating: false } );
		}
	}

	onDomainTokensChange = ( tokens ) => {
		const { errorToDisplay, errors, success } = this.state;
		const filteredTokens = tokens.map( ( value ) => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		this.setPreapprovedDomains( filteredTokens );

		const filteredErrors = pickBy( errors, ( error, key ) => {
			return filteredTokens.includes( key );
		} );

		const filteredSuccess = filter( success, ( successfulValidation ) => {
			return filteredTokens.includes( successfulValidation );
		} );

		this.setState( {
			errors: filteredErrors,
			success: filteredSuccess,
			errorToDisplay: filteredTokens.includes( errorToDisplay ) && errorToDisplay,
		} );

		this.validateDomains( filteredTokens );
	};

	getDomainTokensWithStatus = () => {
		const { success, errors } = this.state;

		const domains = this.getPreapprovedDomains();

		const tokens = domains.map( ( domain ) => {
			if ( errors && errors[ domain ] ) {
				return {
					status: 'error',
					value: domain,
					tooltip: errors[ domain ],
					onMouseEnter: () => this.setState( { errorToDisplay: domain } ),
				};
			}
			if ( ! includes( success, domain ) ) {
				return {
					value: domain,
					status: 'validating',
				};
			}
			return domain;
		} );

		debug( 'Generated tokens: ' + JSON.stringify( tokens ) );
		return tokens;
	};

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			site,
			translate,
			isWPForTeamsSite,
			isP2HubSite,
		} = this.props;

		if ( ! isWPForTeamsSite || ! isP2HubSite ) {
			return <></>;
		}

		const classes = classNames( 'site-settings__p2-settings', {
			'is-loading': isRequestingSettings,
		} );

		return (
			<div className={ classNames( classes ) }>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }

				<SettingsSectionHeader
					disabled={
						isRequestingSettings || isSavingSettings || Object.keys( this.state.errors ).length > 0
					}
					isSaving={ isSavingSettings }
					onButtonClick={ this.handleSubmitForm }
					showButton
					title={ translate( 'Joining this workspace' ) }
				/>
				<Card>
					<form>
						<div className="settings-p2__preapproved-domains">
							<FormFieldset>
								<ToggleControl
									checked={ this.state.isDomainsToggledOn }
									disabled={ isRequestingSettings || isSavingSettings }
									onChange={ this.handleDomainsToggle }
									label={ translate(
										'Allow people with an email address from specified domains to join this workspace.'
									) }
								></ToggleControl>
								{ this.state.isDomainsToggledOn && (
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
											maxLength={ 60 }
											value={ this.getDomainTokensWithStatus() }
											onChange={ this.onDomainTokensChange }
											disabled={ isRequestingSettings }
										/>
										<FormSettingExplanation>
											{ translate(
												'If you enter automattic.com, anybody using an automattic.com email will be able to join this workspace. To add multiple domains, separate them with a comma.'
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
	}
}

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isP2HubSite: isSiteP2Hub( state, siteId ),
	};
} );

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

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( P2GeneralSettingsForm );
