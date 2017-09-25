/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Navigation from '../navigation';
import ActionButtons from '../settings-form/actions';
import EmailCategory from './email-category';
import Card from 'components/card';
import FormSectionHeading from 'components/forms/form-section-heading';
import Main from 'components/main';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggleWPcomEmailSetting, saveSettings } from 'lib/notification-settings-store/actions';
import twoStepAuthorization from 'lib/two-step-authorization';
import ReauthRequired from 'me/reauth-required';
import MeSidebarNavigation from 'me/sidebar-navigation';
import { successNotice, errorNotice } from 'state/notices/actions';

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
			this.props.errorNotice( this.props.translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( this.props.translate( 'Settings saved successfully!' ) );
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
					{ this.props.translate(
						'We\'ll always send important emails regarding your account, security, ' +
						'privacy, and purchase transactions, but you can get some helpful extras, too.'
					) }
				</p>

				<EmailCategory
					name={ options.marketing }
					isEnabled={ this.state.settings.get( options.marketing ) }
					title={ this.props.translate( 'Suggestions' ) }
					description={ this.props.translate( 'Tips for getting the most out of WordPress.com.' ) }
				/>

				<EmailCategory
					name={ options.research }
					isEnabled={ this.state.settings.get( options.research ) }
					title={ this.props.translate( 'Research' ) }
					description={ this.props.translate( 'Opportunities to participate in WordPress.com research and surveys.' ) }
				/>

				<EmailCategory
					name={ options.community } isEnabled={ this.state.settings.get( options.community ) }
					title={ this.props.translate( 'Community' ) }
					description={ this.props.translate( 'Information on WordPress.com courses and events (online and in-person).' ) }
				/>

				<EmailCategory
					name={ options.promotion } isEnabled={ this.state.settings.get( options.promotion ) }
					title={ this.props.translate( 'Promotions' ) }
					description={ this.props.translate( 'Promotions and deals on upgrades.' ) }
				/>

				<EmailCategory
					name={ options.news } isEnabled={ this.state.settings.get( options.news ) }
					title={ this.props.translate( 'News' ) }
					description={ this.props.translate( 'WordPress.com news and announcements.' ) }
				/>

				<EmailCategory
					name={ options.digest } isEnabled={ this.state.settings.get( options.digest ) }
					title={ this.props.translate( 'Digests' ) }
					description={ this.props.translate( 'Popular content from the blogs you follow, and reports on ' +
						'your own site and its performance.' ) }
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
						{ this.props.translate( 'Email from WordPress.com' ) }
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
)( localize( WPCOMNotifications ) );
