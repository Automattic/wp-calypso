import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { PostByEmailSetting } from 'calypso/my-sites/site-settings/publishing-tools/post-by-email';
import { PostByVoiceSetting } from 'calypso/my-sites/site-settings/publishing-tools/post-by-voice';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { regeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isRegeneratingJetpackPostByEmail from 'calypso/state/selectors/is-regenerating-jetpack-post-by-email';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PressThis from '../press-this';

import './style.scss';

class PublishingTools extends Component {
	isMobile() {
		return /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Silk/.test( navigator.userAgent );
	}

	componentDidUpdate() {
		const {
			fields,
			moduleUnavailable,
			postByEmailAddressModuleActive,
			regeneratingPostByEmail,
			selectedSiteId,
		} = this.props;

		if ( ! moduleUnavailable ) {
			return;
		}

		if (
			postByEmailAddressModuleActive &&
			regeneratingPostByEmail === null &&
			! fields.post_by_email_address
		) {
			this.props.regeneratePostByEmail( selectedSiteId );
		}
	}

	onRegenerateButtonClick = () => {
		this.props.regeneratePostByEmail( this.props.selectedSiteId );
	};

	isFormPending() {
		const { isRequestingSettings, isSavingSettings } = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderPostByEmailModule() {
		const isRequestingSettings = false;
		const isSavingSettings = false;

		return (
			<CompactCard className="site-settings__module-settings">
				<QueryJetpackConnection siteId={ this.props.selectedSiteId } />

				<FormFieldset>
					<PostByEmailSetting
						isFormPending={ isRequestingSettings || isSavingSettings }
						address={ this.props.fields.post_by_email_address }
					/>
				</FormFieldset>
			</CompactCard>
		);
	}

	renderPostByVoiceModule() {
		return (
			<CompactCard className="site-settings__module-settings">
				<FormFieldset>
					<PostByVoiceSetting />
				</FormFieldset>
			</CompactCard>
		);
	}

	renderPressThisModule() {
		return (
			<CompactCard className="site-settings__module-settings">
				<FormFieldset>
					<PressThis />
				</FormFieldset>
			</CompactCard>
		);
	}

	render() {
		const { translate, siteIsJetpack, isAtomic } = this.props;

		const renderPressThis = config.isEnabled( 'press-this' ) && ! this.isMobile();
		const renderPostByVoice =
			config.isEnabled( 'settings/post-by-voice' ) && ! siteIsJetpack && ! isAtomic;

		if ( ! renderPressThis && ! renderPostByVoice ) {
			return;
		}

		return (
			<div>
				<SettingsSectionHeader title={ translate( 'Publishing Tools' ) } />

				{ this.renderPostByEmailModule() }
				{ renderPostByVoice && this.renderPostByVoiceModule() }
				{ renderPressThis && this.renderPressThisModule() }
			</div>
		);
	}
}

PublishingTools.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

PublishingTools.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, selectedSiteId );
		const isAtomic = isSiteAutomatedTransfer( state, selectedSiteId );
		const regeneratingPostByEmail = isRegeneratingJetpackPostByEmail( state, selectedSiteId );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			'post-by-email'
		);

		return {
			siteIsJetpack,
			isAtomic,
			selectedSiteId,
			regeneratingPostByEmail,
			postByEmailAddressModuleActive: !! isJetpackModuleActive(
				state,
				selectedSiteId,
				'post-by-email'
			),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		};
	},
	{
		regeneratePostByEmail,
	}
)( localize( PublishingTools ) );
