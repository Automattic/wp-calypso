/**
 * External dependencies
 */
var React = require( 'react' ),
	connect = require( 'react-redux' ).connect,
	classnames = require( 'classnames' ),
	property = require( 'lodash/property' ),
	sortBy = require( 'lodash/sortBy' );

/**
 * Internal dependencies
 */
var MasterbarLoggedIn = require( 'layout/masterbar/logged-in' ),
	MasterbarLoggedOut = require( 'layout/masterbar/logged-out' ),
	observe = require( 'lib/mixins/data-observe' ),
	GlobalNotices = require( 'components/global-notices' ),
	notices = require( 'notices' ),
	translator = require( 'lib/translator-jumpstart' ),
	TranslatorInvitation = require( './community-translator/invitation' ),
	TranslatorLauncher = require( './community-translator/launcher' ),
	PollInvitation = require( './poll-invitation' ),
	PreferencesData = require( 'components/data/preferences-data' ),
	PushNotificationPrompt = require( 'components/push-notification/prompt' ),
	Welcome = require( 'my-sites/welcome/welcome' ),
	WelcomeMessage = require( 'layout/nux-welcome/welcome-message' ),
	GuidedTours = require( 'layout/guided-tours' ),
	analytics = require( 'lib/analytics' ),
	config = require( 'config' ),
	abtest = require( 'lib/abtest' ).abtest,
	PulsingDot = require( 'components/pulsing-dot' ),
	SitesListNotices = require( 'lib/sites-list/notices' ),
	OfflineStatus = require( 'layout/offline-status' ),
	PollerPool = require( 'lib/data-poller' ),
	QueryPreferences = require( 'components/data/query-preferences' ),
	KeyboardShortcutsMenu,
	Layout,
	SupportUser,
	Happychat = require( 'components/happychat' );

import { isOffline } from 'state/application/selectors';
import { hasSidebar } from 'state/ui/selectors';
import { isHappychatOpen } from 'state/ui/happychat/selectors';
import SitePreview from 'blocks/site-preview';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import DocumentHead from 'components/data/document-head';

if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
	KeyboardShortcutsMenu = require( 'lib/keyboard-shortcuts/menu' );
}

if ( config.isEnabled( 'support-user' ) ) {
	SupportUser = require( 'support/support-user' );
}

Layout = React.createClass( {
	displayName: 'Layout',

	mixins: [ SitesListNotices, observe( 'user', 'nuxWelcome', 'sites', 'translatorInvitation' ) ],

	_sitesPoller: null,

	propTypes: {
		primary: React.PropTypes.element,
		secondary: React.PropTypes.element,
		tertiary: React.PropTypes.element,
		sites: React.PropTypes.object,
		user: React.PropTypes.object,
		nuxWelcome: React.PropTypes.object,
		translatorInvitation: React.PropTypes.object,
		focus: React.PropTypes.object,
		// connected props
		isLoading: React.PropTypes.bool,
		isSupportUser: React.PropTypes.bool,
		section: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object,
		] ),
		isOffline: React.PropTypes.bool,
	},

	componentWillUpdate: function( nextProps ) {
		if ( this.props.section.group !== nextProps.section.group ) {
			if ( nextProps.section.group === 'sites' ) {
				setTimeout( function() {
					if ( ! this.isMounted() || this._sitesPoller ) {
						return;
					}
					this._sitesPoller = PollerPool.add( this.props.sites, 'fetchAvailableUpdates', { interval: 900000 } );
				}.bind( this ), 0 );
			} else {
				this.removeSitesPoller();
			}
		}
	},

	componentWillUnmount: function() {
		this.removeSitesPoller();
	},

	removeSitesPoller: function() {
		if ( ! this._sitesPoller ) {
			return;
		}

		PollerPool.remove( this._sitesPoller );
		this._sitesPoller = null;
	},
	closeWelcome: function() {
		this.props.nuxWelcome.closeWelcome();
		analytics.ga.recordEvent( 'Welcome Box', 'Clicked Close Button' );
	},

	newestSite: function() {
		return sortBy( this.props.sites.get(), property( 'ID' ) ).pop();
	},

	renderPushNotificationPrompt: function() {
		const participantInAbTest = abtest( 'browserNotifications' ) === 'enabled';
		if ( ! ( config.isEnabled( 'push-notifications' ) && participantInAbTest ) ) {
			return null;
		}

		if ( ! this.props.user ) {
			return null;
		}

		return <PushNotificationPrompt user={ this.props.user } section={ this.props.section } isLoading={ this.props.isLoading } />;
	},

	renderMasterbar: function() {
		if ( 'login' === this.props.section.name ) {
			return null;
		}

		if ( ! this.props.user ) {
			return <MasterbarLoggedOut showSignup={ 'signup' !== this.props.section.name } />;
		}

		return (
			<MasterbarLoggedIn
				user={ this.props.user }
				section={ this.props.section.group }
				sites={ this.props.sites } />
		);
	},

	renderWelcome: function() {
		const translatorInvitation = this.props.translatorInvitation;

		if ( ! this.props.user ) {
			return null;
		}

		const showWelcome = this.props.nuxWelcome.getWelcome();
		const newestSite = this.newestSite();
		const showInvitation = ! showWelcome &&
				translatorInvitation.isPending() &&
				translatorInvitation.isValidSection( this.props.section.name );
		const disablePollInvitation = showWelcome || showInvitation;

		return (
			<span>
				<Welcome isVisible={ showWelcome } closeAction={ this.closeWelcome } additionalClassName="NuxWelcome">
					<WelcomeMessage welcomeSite={ newestSite } />
				</Welcome>
				<TranslatorInvitation isVisible={ showInvitation } />
				<PreferencesData>
					<PollInvitation isVisible={ ! disablePollInvitation } section={ this.props.section } />
				</PreferencesData>
			</span>
		);
	},

	renderPreview() {
		if ( config.isEnabled( 'preview-layout' ) && this.props.section.group === 'sites' ) {
			return (
				<SitePreview />
			);
		}
	},

	render: function() {
		const sectionClass = classnames(
				'layout',
				`is-group-${this.props.section.group}`,
				`is-section-${this.props.section.name}`,
				`focus-${this.props.currentLayoutFocus}`,
				{ 'is-support-user': this.props.isSupportUser },
				{ 'has-no-sidebar': ! this.props.hasSidebar },
				{ 'wp-singletree-layout': !! this.props.primary }
			),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.props.isLoading
			} );

		return (
			<div className={ sectionClass }>
				<DocumentHead />
				<QueryPreferences />
				{ config.isEnabled( 'guided-tours' ) ? <GuidedTours /> : null }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<div className={ loadingClass } ><PulsingDot active={ this.props.isLoading } chunkName={ this.props.section.name } /></div>
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ this.renderWelcome() }
					{ this.renderPushNotificationPrompt() }
					<GlobalNotices id="notices" notices={ notices.list } forcePinned={ 'post' === this.props.section.name } />
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
					<div id="secondary" className="layout__secondary">
						{ this.props.secondary }
					</div>
				</div>
				<div id="tertiary">
					{ this.props.tertiary }
				</div>
				<TranslatorLauncher
					isEnabled={ translator.isEnabled() }
					isActive={ translator.isActivated() }/>
				{ this.renderPreview() }
				{ config.isEnabled( 'happychat' ) && this.props.chatIsOpen && <Happychat /> }
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const { isLoading, section } = state.ui;
		return {
			isLoading,
			isSupportUser: state.support.isSupportUser,
			section,
			hasSidebar: hasSidebar( state ),
			isOffline: isOffline( state ),
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			chatIsOpen: isHappychatOpen( state )
		};
	}
)( Layout );
