import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { flowRight } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import wrapSettingsForm from '../wrap-settings-form';

export class P2GeneralSettingsForm extends Component {
	state = {
		showPreapprovedDomainsTextBox: false,
	};

	handleSubmitForm = () => {
		// TODO
	};

	handleP2PreapprovedDomainsToggle = () => {
		this.setState( { showPreapprovedDomainsTextBox: ! this.state.showPreapprovedDomainsTextBox } );
	};

	render() {
		const {
			fields,
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
					disabled={ isRequestingSettings || isSavingSettings }
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
										<FormInput
											name="p2_preapproved_domains"
											id="p2-preapproved-domains"
											data-tip-target="p2-preapproved-domains-input"
											value={ fields.p2_preapproved_domains || '' }
											onChange={ null } // TODO
											disabled={ isRequestingSettings }
											onClick={ null } // TODO
											onKeyPress={ null } // TODO
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
