/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Protect from './protect';
import Sso from './sso';
import CredentialsContext from './credentials-context';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import { getSelectedSiteId } from 'state/ui/selectors';
import { siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import {
	isJetpackModuleActive,
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode
} from 'state/selectors';
import SpamFilteringSettings from './spam-filtering-settings';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import Gridicon from 'gridicons';
import { rewindSetCredentials as rewindSetCredentialsAction } from 'state/activity-log/actions';

class SiteSettingsFormBackups extends Component {

	render() {
		const {
			translate,
			siteId
		} = this.props;

		const helpLabel = (
			<div>
				<Gridicon icon="help" />
				<span>{ translate( 'Need help finding your site\'s server credentials?' ) }</span>
			</div>
		);

		const defaultCreds = {
			enable: false,
			status: 'invalid',
			host: '',
			port: '',
			user: '',
			pass: '',
			kpub: '',
			upload_path: '',
		};

		return (
			<form id="site-settings" className="site-settings__backups">
				<SectionHeader label={ translate( 'Site Credentials' ) } />
				<CredentialsContext
					siteId={ siteId }
					connectionType="ssh"
					connectionTypeText={ translate( 'SSH' ) }
					connectionTypeDescription={ translate( 'Secure Shell, the most complete and secure way to access your site.' ) }
					isActiveConnection={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', 'ssh', 'credentials', 'enable' ], false ) ? true : false }
					existingCreds={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', 'ssh', 'credentials' ], defaultCreds ) }
					isPressable={ get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null ) }
					setCredentials={ this.props.rewindSetCredentials }
				/>
				<CredentialsContext
					siteId={ siteId }
					connectionType="sftp"
					connectionTypeText={ translate( 'SFTP' ) }
					connectionTypeDescription={ translate( 'Secure File Transfer Protocol, a secure way to access your site\'s files.' ) }
					isActiveConnection={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', 'sftp', 'credentials', 'enable' ], false ) ? true : false }
					existingCreds={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', 'sftp', 'credentials' ], defaultCreds ) }
					isPressable={ get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null ) }
					setCredentials={ this.props.rewindSetCredentials }
				/>
				<CredentialsContext
					siteId={ siteId }
					connectionType="ftp"
					connectionTypeText={ translate( 'FTP' ) }
					connectionTypeDescription={ translate( 'File Transfer Protocol, the most common way to access your files.' ) }
					isActiveConnection={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', 'ftp', 'credentials', 'enable' ], false ) ? true : false }
					existingCreds={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', 'ftp', 'credentials' ], defaultCreds ) }
					isPressable={ get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null ) }
					setCredentials={ this.props.rewindSetCredentials }
				/>
				<SectionHeader 
					className="credentials-help"
					label={ helpLabel } 
				/>
			</form>
		);
	}

}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const protectModuleActive = !! isJetpackModuleActive( state, siteId, 'protect' );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
		const protectIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, siteId, 'protect' );
		const akismetIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, siteId, 'akismet' );
		const jetpackSettingsUiSupported = siteSupportsJetpackSettingsUi( state, siteId );

		return {
			jetpackSettingsUiSupported,
			protectModuleActive,
			protectModuleUnavailable: siteInDevMode && protectIsUnavailableInDevMode,
			akismetUnavailable: siteInDevMode && akismetIsUnavailableInDevMode,
		};
	}, {
		rewindSetCredentials: rewindSetCredentialsAction,
	}
);

const getFormSettings = partialRight( pick, [
	'akismet',
	'protect',
	'jetpack_protect_global_whitelist',
	'sso',
	'jetpack_sso_match_by_email',
	'jetpack_sso_require_two_step',
	'wordpress_api_key'
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormBackups );
