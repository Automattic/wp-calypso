/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Navigation from '../navigation';
import Card from 'components/card';
import FormSectionHeading from 'components/forms/form-section-heading';
import ActionButtons from '../settings-form/actions';
import {
	fetchSettings,
	toggleWPcomEmailSetting,
	saveSettings,
} from 'state/notification-settings/actions';
import {
	getNotificationSettings,
	hasUnsavedNotificationSettingsChanges,
} from 'state/notification-settings/selectors';
import EmailCategory from './email-category';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Module variables
 */
const options = {
	marketing: 'marketing',
	research: 'research',
	community: 'community',
	promotion: 'promotion',
	news: 'news',
	digest: 'digest',
};

class WPCOMNotifications extends React.Component {
	static displayName = 'WPCOMNotifications';

	// TODO: Add propTypes

	componentDidMount() {
		this.props.fetchSettings();
	}

	toggleSetting = setting => {
		this.props.toggleWPcomEmailSetting( setting );
	};

	saveSettings = () => {
		this.props.saveSettings( 'wpcom', this.props.settings );
	};

	renderWpcomPreferences = () => {
		const { settings, translate } = this.props;

		return (
			<div>
				<p>
					{ translate(
						"We'll always send important emails regarding your account, security, " +
							'privacy, and purchase transactions, but you can get some helpful extras, too.'
					) }
				</p>

				<EmailCategory
					name={ options.marketing }
					isEnabled={ get( settings, options.marketing ) }
					title={ translate( 'Suggestions' ) }
					description={ translate( 'Tips for getting the most out of WordPress.com.' ) }
				/>

				<EmailCategory
					name={ options.research }
					isEnabled={ get( settings, options.research ) }
					title={ translate( 'Research' ) }
					description={ translate(
						'Opportunities to participate in WordPress.com research and surveys.'
					) }
				/>

				<EmailCategory
					name={ options.community }
					isEnabled={ get( settings, options.community ) }
					title={ translate( 'Community' ) }
					description={ translate(
						'Information on WordPress.com courses and events (online and in-person).'
					) }
				/>

				<EmailCategory
					name={ options.promotion }
					isEnabled={ get( settings, options.promotion ) }
					title={ translate( 'Promotions' ) }
					description={ translate( 'Promotions and deals on upgrades.' ) }
				/>

				<EmailCategory
					name={ options.news }
					isEnabled={ get( settings, options.news ) }
					title={ translate( 'News' ) }
					description={ translate( 'WordPress.com news and announcements.' ) }
				/>

				<EmailCategory
					name={ options.digest }
					isEnabled={ get( settings, options.digest ) }
					title={ translate( 'Digests' ) }
					description={ translate(
						'Popular content from the blogs you follow, and reports on ' +
							'your own site and its performance.'
					) }
				/>

				<ActionButtons onSave={ this.saveSettings } disabled={ ! this.props.hasUnsavedChanges } />
			</div>
		);
	};

	renderPlaceholder = () => {
		return <p className="notification-settings-wpcom-settings__placeholder">&nbsp;</p>;
	};

	render() {
		return (
			<Main>
				<PageViewTracker
					path="/me/notifications/updates"
					title="Me > Notifications > Updates from WordPress.com"
				/>
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<Navigation path={ this.props.path } />

				<Card>
					<FormSectionHeading>
						{ this.props.translate( 'Email from WordPress.com' ) }
					</FormSectionHeading>
					{ this.props.settings ? this.renderWpcomPreferences() : this.renderPlaceholder() }
				</Card>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		settings: getNotificationSettings( state, 'wpcom' ),
		hasUnsavedChanges: hasUnsavedNotificationSettingsChanges( state, 'wpcom' ),
	} ),
	{ fetchSettings, toggleWPcomEmailSetting, saveSettings }
)( localize( WPCOMNotifications ) );
