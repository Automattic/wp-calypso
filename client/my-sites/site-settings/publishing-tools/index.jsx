import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import PressThis from 'calypso/my-sites/site-settings/press-this';
import { PostByEmailSetting } from 'calypso/my-sites/site-settings/publishing-tools/post-by-email';
import { PostByVoiceSetting } from 'calypso/my-sites/site-settings/publishing-tools/post-by-voice';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

import './style.scss';

class PublishingTools extends Component {
	isMobile() {
		return /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Silk/.test( navigator.userAgent );
	}

	renderPostByEmailModule() {
		return (
			<CompactCard className="site-settings__module-settings">
				<QueryJetpackConnection siteId={ this.props.siteId } />

				<FormFieldset>
					<PostByEmailSetting emailAddress={ this.props.fields?.post_by_email_address } />
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
		const renderPostByVoice = ! siteIsJetpack && ! isAtomic;

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

PublishingTools.propTypes = {
	fields: PropTypes.object,
	isAtomic: PropTypes.bool,
	siteId: PropTypes.number.isRequired,
	siteIsJetpack: PropTypes.bool,
};

export default localize( PublishingTools );
