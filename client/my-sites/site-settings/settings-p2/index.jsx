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
	state = {
		showPreapprovedDomainsTextBox: false,
		preapprovedDomains: [],
		success: [],
		errors: {},
		errorToDisplay: '',
	};

	handleSubmitForm = () => {
		// TODO
	};

	handleP2PreapprovedDomainsToggle = () => {
		this.setState( {
			...this.state,
			showPreapprovedDomainsTextBox: ! this.state.showPreapprovedDomainsTextBox,
			preapprovedDomains: [], // always empty when toggle is triggered
		} );
	};

	refreshValidation = ( success = [], errors = {} ) => {
		const errorsKeys = Object.keys( errors );
		const errorToDisplay =
			this.state.errorToDisplay || ( errorsKeys.length > 0 && errorsKeys[ 0 ] );

		this.setState( {
			errorToDisplay,
			errors,
			success,
		} );
	};

	async validateDomains( siteId, preapprovedDomains ) {
		try {
			// TODO Should this be GET? Technically we are not creating anything.
			const { success, errors } = await wpcom.req.get(
				{
					path: `/p2/hub-settings/domains/validate`,
					apiNamespace: 'wpcom/v2',
				},
				{
					domains: preapprovedDomains.join( ',' ),
				}
			);

			this.refreshValidation( success, errors );

			// this.props.recordTracksEvent( 'calypso_p2_preapproved_domain_validation_success' );
		} catch ( error ) {
			// this.props.recordTracksEvent( 'calypso_p2_preapproved_domain_validation_failed' );
		}
	}

	onTokensChange = ( tokens ) => {
		const { errorToDisplay, errors, success } = this.state;
		const filteredTokens = tokens.map( ( value ) => {
			if ( 'object' === typeof value ) {
				return value.value;
			}
			return value;
		} );

		const filteredErrors = pickBy( errors, ( error, key ) => {
			return filteredTokens.includes( key );
		} );

		const filteredSuccess = filter( success, ( successfulValidation ) => {
			return filteredTokens.includes( successfulValidation );
		} );

		this.setState( {
			preapprovedDomains: filteredTokens,
			errors: filteredErrors,
			success: filteredSuccess,
			errorToDisplay: filteredTokens.includes( errorToDisplay ) && errorToDisplay,
		} );

		this.validateDomains( this.props.siteId, filteredTokens );
	};

	getTokensWithStatus = () => {
		const { success, errors } = this.state;

		const tokens = this.state.preapprovedDomains.map( ( domain ) => {
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

		const classes = classNames( 'site-settings__general-settings', {
			'is-loading': isRequestingSettings,
		} );

		return (
			<div className={ classNames( classes ) }>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }

				<SettingsSectionHeader
					data-tip-target="settings-site-profile-save"
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
									checked={ this.state.showPreapprovedDomainsTextBox }
									disabled={ isRequestingSettings || isSavingSettings }
									onChange={ this.handleP2PreapprovedDomainsToggle }
									label={ translate(
										'Allow people with an email address from specified domains to join this workspace.'
									) }
								></ToggleControl>
								{ this.state.showPreapprovedDomainsTextBox && (
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
											value={ this.getTokensWithStatus() }
											onChange={ this.onTokensChange }
											onFocus={ /*this.onFocusTokenField*/ () => {} } // TODO
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
