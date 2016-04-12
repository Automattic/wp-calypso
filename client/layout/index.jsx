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
	EmailVerificationNotice = require( 'components/email-verification/email-verification-notice' ),
	Welcome = require( 'my-sites/welcome/welcome' ),
	WelcomeMessage = require( 'layout/nux-welcome/welcome-message' ),
	GuidedTours = require( 'layout/guided-tours' ),
	analytics = require( 'lib/analytics' ),
	config = require( 'config' ),
	PulsingDot = require( 'components/pulsing-dot' ),
	SitesListNotices = require( 'lib/sites-list/notices' ),
	OfflineStatus = require( 'layout/offline-status' ),
	PollerPool = require( 'lib/data-poller' ),
	KeyboardShortcutsMenu,
	Layout,
	SupportUser;

import { isOffline } from 'state/application/selectors';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';

if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
	KeyboardShortcutsMenu = require( 'lib/keyboard-shortcuts/menu' );
}

if ( config.isEnabled( 'support-user' ) ) {
	SupportUser = require( 'support/support-user' );
}

Layout = React.createClass( {
	displayName: 'Layout',

	mixins: [ SitesListNotices, observe( 'user', 'focus', 'nuxWelcome', 'sites', 'translatorInvitation' ) ],

	_sitesPoller: null,

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

	renderEmailVerificationNotice: function() {
		if ( ! this.props.user ) {
			return null;
		}

		return <EmailVerificationNotice user={ this.props.user } />;
	},

	renderMasterbar: function() {
		if ( 'login' === this.props.section.name ) {
			return null;
		}

		if ( ! this.props.user ) {
			return <MasterbarLoggedOut/>;
		}

		return (
			<MasterbarLoggedIn
				user={ this.props.user }
				section={ this.props.section.group }
				sites={ this.props.sites } />
		);
	},

	renderWelcome: function() {
		var translatorInvitation = this.props.translatorInvitation,
			showInvitation,
			showWelcome,
			newestSite,
			disablePollInvitation;

		if ( ! this.props.user ) {
			return null;
		}

		showWelcome = this.props.nuxWelcome.getWelcome();
		newestSite = this.newestSite();
		showInvitation = ! showWelcome &&
				translatorInvitation.isPending() &&
				translatorInvitation.isValidSection( this.props.section.name );
		disablePollInvitation = showWelcome || showInvitation;

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

	render: function() {
		var sectionClass = classnames(
				'wp',
				'layout',
				`is-group-${this.props.section.group}`,
				`is-section-${this.props.section.name}`,
				`focus-${this.props.focus.getCurrent()}`,
				{ 'is-support-user': this.props.isSupportUser },
				{ 'has-no-sidebar': ! this.props.section.secondary }
			),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.props.isLoading
			} );

		return (
			<div className={ sectionClass }>
				{ config.isEnabled( 'guided-tours' ) && this.props.tourState.shouldShow ? <GuidedTours /> : null }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<div className={ loadingClass } ><PulsingDot active={ this.props.isLoading } chunkName={ this.props.section.name } /></div>
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="wp-content">
					{ this.renderWelcome() }
					{ this.renderEmailVerificationNotice() }
					<GlobalNotices id="notices" notices={ notices.list } forcePinned={ 'post' === this.props.section.name } />
					<div id="primary" className="wp-primary wp-section" />
					<div id="secondary" className="wp-secondary" />
				</div>
				<div id="tertiary" />
				<TranslatorLauncher
					isEnabled={ translator.isEnabled() }
					isActive={ translator.isActivated() }/>
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
			isOffline: isOffline( state ),
			tourState: getGuidedTourState( state ),
		};
	}
)( Layout );
