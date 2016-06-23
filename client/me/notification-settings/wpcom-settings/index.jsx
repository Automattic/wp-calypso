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
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';
import ActionButtons from '../settings-form/actions';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggleWPcomEmailSetting, saveSettings } from 'lib/notification-settings-store/actions';
import { successNotice, errorNotice } from 'state/notices/actions';

/**
 * Module variables
 */
const options = {
	marketing: 'marketing',
	research: 'research',
	community: 'community',
	promotion: 'promotion',
	news: 'news'
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

	renderWpcomPreferences() {
		return (
			<div>
				<p>{ this.translate( 'We\'ll always send important emails regarding your account, security, privacy, and purchase transactions, but you can get some fun extras, too!' ) }</p>

				<FormFieldset>
					<FormLegend>{ this.translate( 'Suggestions' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ this.state.settings.get( options.marketing ) } onChange={ this.toggleSetting.bind( this, options.marketing ) }/>
						<span>{ this.translate( 'Tips for getting the most out of WordPress.com.' ) }</span>
					</FormLabel>
				</FormFieldset>

				<FormFieldset>
					<FormLegend>{ this.translate( 'Research' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ this.state.settings.get( options.research ) } onChange={ this.toggleSetting.bind( this, options.research ) }/>
						<span>{ this.translate( 'Opportunities to participate in WordPress.com research & surveys.' ) }</span>
					</FormLabel>
				</FormFieldset>

				<FormFieldset>
					<FormLegend>{ this.translate( 'Community' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ this.state.settings.get( options.community ) } onChange={ this.toggleSetting.bind( this, options.community ) }/>
						<span>{ this.translate( 'Information on WordPress.com courses and events (online & in-person).' ) }</span>
					</FormLabel>
				</FormFieldset>

				<FormFieldset>
					<FormLegend>{ this.translate( 'Promotions' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ this.state.settings.get( options.promotion ) } onChange={ this.toggleSetting.bind( this, options.promotion ) }/>
						<span>{ this.translate( 'Promotions and deals on upgrades.' ) }</span>
					</FormLabel>
				</FormFieldset>

				<FormFieldset>
					<FormLegend>{ this.translate( 'News' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ this.state.settings.get( options.news ) } onChange={ this.toggleSetting.bind( this, options.news ) }/>
						<span>{ this.translate( 'WordPress.com news and announcements.' ) }</span>
					</FormLabel>
				</FormFieldset>

				<ActionButtons
					onSave={ () => saveSettings( 'wpcom', this.state.settings ) }
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
					<FormSectionHeading className="is-primary">
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
