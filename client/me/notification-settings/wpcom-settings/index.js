/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
import store from 'lib/notification-settings-store';
import { fetchSettings, toggleWPcomEmailSetting, saveSettings } from 'lib/notification-settings-store/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import EmailCategory from './email-category';

/**
 * Module variables
 */
const options = {
	marketing: 'marketing',
	research: 'research',
	community: 'community',
	promotion: 'promotion',
	news: 'news',
	digest: 'digest'
};

const WPCOMNotifications = React.createClass( {
	displayName: 'WPCOMNotifications',

	getInitialState() {
		return {
			settings: null
		};
	},

	componentDidMount() {
		store.on( 'change', this.onChange );
		fetchSettings();
	},

	componentWillUnmount() {
		store.off( 'change', this.onChange );
	},

	onChange() {
		const state = store.getStateFor( 'wpcom' );

		if ( state.error ) {
			this.props.errorNotice( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( this.translate( 'Settings saved successfully!' ) );
		}

		this.setState( state );
	},

	toggleSetting( setting ) {
		toggleWPcomEmailSetting( setting );
	},

	saveSettings() {
		saveSettings( 'wpcom', this.state.settings );
	},

	renderWpcomPreferences() {
		return (
			<div>
				<p>
					{ this.translate(
						'We\'ll always send important emails regarding your account, security, ' +
						'privacy, and purchase transactions, but you can get some helpful extras, too.'
					) }
				</p>

				<EmailCategory
					name={ options.marketing }
					isEnabled={ this.state.settings.get( options.marketing ) }
					title={ this.translate( 'Suggestions' ) }
					description={ this.translate( 'Tips for getting the most out of WordPress.com.' ) }
				/>

				<EmailCategory
					name={ options.research }
					isEnabled={ this.state.settings.get( options.research ) }
					title={ this.translate( 'Research' ) }
					description={ this.translate( 'Opportunities to participate in WordPress.com research & surveys.' ) }
				/>

				<EmailCategory
					name={ options.community } isEnabled={ this.state.settings.get( options.community ) }
					title={ this.translate( 'Community' ) }
					description={ this.translate( 'Information on WordPress.com courses and events (online & in-person).' ) }
				/>

				<EmailCategory
					name={ options.promotion } isEnabled={ this.state.settings.get( options.promotion ) }
					title={ this.translate( 'Promotions' ) }
					description={ this.translate( 'Promotions and deals on upgrades.' ) }
				/>

				<EmailCategory
					name={ options.news } isEnabled={ this.state.settings.get( options.news ) }
					title={ this.translate( 'News' ) }
					description={ this.translate( 'WordPress.com news and announcements.' ) }
				/>

				<EmailCategory
					name={ options.digest } isEnabled={ this.state.settings.get( options.digest ) }
					title={ this.translate( 'Digests' ) }
					description={ this.translate( 'Reading & writing digests, tailored for you.' ) }
				/>

				<ActionButtons
					onSave={ this.saveSettings }
					disabled={ ! this.state.hasUnsavedChanges }
				/>
			</div>
		);
	},

	renderPlaceholder() {
		return (
			<p className="notification-settings-wpcom-settings__placeholder">&nbsp;</p>
		);
	},

	render() {
		return (
			<Main>
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<Navigation path={ this.props.path } />

				<Card>
					<FormSectionHeading>
						{ this.translate( 'Email from WordPress.com' ) }
					</FormSectionHeading>
					{ this.state.settings ? this.renderWpcomPreferences() : this.renderPlaceholder() }
				</Card>
			</Main>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, errorNotice }, dispatch )
)( WPCOMNotifications );
