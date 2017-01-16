/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isModuleActive, isFetchingModules } from 'state/jetpack/modules/selectors';
import {
	getJetpackSettings,
	isRequestingJetpackSettings,
	isUpdatingJetpackSettings
} from 'state/jetpack/settings/selectors';
import { fetchSettings, updateSettings } from 'state/jetpack/settings/actions';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import ClipboardButtonInput from 'components/clipboard-button-input';

class PublishingTools extends Component {
	constructor( props ) {
		super( props );

		this.state = this.buildRegeneratingState( false );

		this.refreshSettings = this.refreshSettings.bind( this );
		this.onRegenerateButtonClick = this.onRegenerateButtonClick.bind( this );
	}

	buildRegeneratingState( regenerating = false ) {
		return {
			regenerating
		};
	}

	refreshSettings() {
		const { selectedSiteId } = this.props;

		this.props.fetchSettings( selectedSiteId ).then( () => {
			this.setState( this.buildRegeneratingState( false ) );
		} );
	}

	onRegenerateButtonClick() {
		const { selectedSiteId } = this.props;

		this.setState( this.buildRegeneratingState( true ) );

		this.props.updateSettings( selectedSiteId, {
			post_by_email_address: 'regenerate'
		} ).then( this.refreshSettings );
	}

	isFormPending() {
		const {
			fetchingSettings,
			fetchingModuleData,
			submittingForm,
			updatingSettings
		} = this.props;

		return fetchingSettings || fetchingModuleData || submittingForm || updatingSettings || this.state.regenerating;
	}

	renderHeader() {
		const {
			onSubmitForm,
			submittingForm,
			translate
		} = this.props;

		return (
			<SectionHeader label={ translate( 'Publishing Tools' ) }>
				<Button
					compact
					primary
					onClick={ onSubmitForm }
					disabled={ this.isFormPending() }
				>
					{ submittingForm
						? translate( 'Saving…' )
						: translate( 'Save Settings' )
					}
				</Button>
			</SectionHeader>
		);
	}

	renderPostByEmailSettings() {
		const { moduleSettings, translate } = this.props;
		const isFormPending = this.isFormPending();
		const email = moduleSettings && moduleSettings.post_by_email_address;

		return (
			<div className="publishing-tools__module-settings is-indented">
				<FormLabel>
					{ translate( 'Email Address' ) }
				</FormLabel>
				<ClipboardButtonInput
					className="publishing-tools__email-address"
					disabled={ isFormPending }
					value={ email !== 'regenerate' ? email : '' }
				/>
				<Button
					compact
					onClick={ this.onRegenerateButtonClick }
					disabled={ isFormPending }
				>
					{ isFormPending
						? translate( 'Regenerating…' )
						: translate( 'Regenerate address' )
					}
				</Button>
			</div>
		);
	}

	renderPostByEmailModule() {
		const {
			selectedSiteId,
			postByEmailAddressModuleActive,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="publishing-tools__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink icon={ true } href={ 'https://jetpack.com/support/post-by-email/' } target="_blank">
							{ translate( 'Learn more about Post by Email' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="post-by-email"
					label={ translate( 'Publish posts by sending an email.' ) }
					disabled={ formPending }
					/>

				{
					postByEmailAddressModuleActive && this.renderPostByEmailSettings()
				}
			</FormFieldset>
		);
	}

	render() {
		const { selectedSiteId } = this.props;

		return (
			<div>
				<QueryJetpackModules siteId={ selectedSiteId } />
				<QueryJetpackSettings siteId={ selectedSiteId } />

				{ this.renderHeader() }

				<Card className="publishing-tools__card site-settings">
					{ this.renderPostByEmailModule() }
				</Card>
			</div>
		);
	}
}

PublishingTools.defaultProps = {
	submittingForm: false,
};

PublishingTools.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	fetchingSettings: PropTypes.bool.isRequired,
	submittingForm: PropTypes.bool,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const fetchingModules = isFetchingModules( state, selectedSiteId );
		const fetchingSettings = isRequestingJetpackSettings( state, selectedSiteId );
		const moduleSettings = pick( getJetpackSettings( state, selectedSiteId ), [
			'post_by_email_address',
		] );

		return {
			selectedSiteId,
			postByEmailAddressModuleActive: !! isModuleActive( state, selectedSiteId, 'post-by-email' ),
			moduleSettings,
			fetchingModuleData: !! ( fetchingModules || fetchingSettings ),
			updatingSettings: isUpdatingJetpackSettings( state, selectedSiteId ),
		};
	},
	{
		fetchSettings,
		updateSettings
	}
)( localize( PublishingTools ) );
