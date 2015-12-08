/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	property = require( 'lodash/utility/property' ),
	sortBy = require( 'lodash/collection/sortBy' );

/**
 * Internal dependencies
 */
var Masterbar = require( './masterbar' ),
	observe = require( 'lib/mixins/data-observe' ),
	GlobalNotices = require( 'notices/global-notices' ),
	NoticesList = require( 'notices/notices-list' ),
	notices = require( 'notices' ),
	translator = require( 'lib/translator-jumpstart' ),
	TranslatorInvitation = require( './community-translator/invitation' ),
	TranslatorLauncher = require( './community-translator/launcher' ),
	EmailVerificationNotice = require( 'components/email-verification/email-verification-notice' ),
	Welcome = require( 'my-sites/welcome/welcome' ),
	WelcomeMessage = require( 'nux-welcome/welcome-message' ),
	InviteMessage = require( 'my-sites/invites/invite-message' ),
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	PulsingDot = require( 'components/pulsing-dot' ),
	SitesListNotices = require( 'lib/sites-list/notices' ),
	PollerPool = require( 'lib/data-poller' ),
	KeyboardShortcutsMenu;

if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
	KeyboardShortcutsMenu = require( 'lib/keyboard-shortcuts/menu' );
}

module.exports = React.createClass( {
	displayName: 'Layout',

	mixins: [ SitesListNotices, observe( 'user', 'focus', 'nuxWelcome', 'sites', 'translatorInvitation' ) ],

	_sitesPoller: null,

	componentWillUpdate: function( nextProps, nextState ) {
		if ( this.state.section !== nextState.section ) {
			if ( nextState.section === 'sites' ) {
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

	getInitialState: function() {
		return {
			section: false,
			isLoading: false,
			noSidebar: false
		};
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

	render: function() {
		var sectionClass = 'wp layout is-section-' + this.state.section + ' focus-' + this.props.focus.getCurrent(),
			showWelcome = this.props.nuxWelcome.getWelcome(),
			newestSite = this.newestSite(),
			translatorInvitation = this.props.translatorInvitation,
			showInvitation = ! showWelcome &&
				translatorInvitation.isPending() &&
				translatorInvitation.isValidSection( this.state.section ),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.state.isLoading
			} );

		if ( this.state.noSidebar ) {
			sectionClass += ' has-no-sidebar';
		}

		return (
			<div className={ sectionClass }>
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				<Masterbar user={ this.props.user } section={ this.state.section } sites={ this.props.sites }/>
				<div className={ loadingClass } ><PulsingDot active={ this.state.isLoading } /></div>
				<div id="content" className="wp-content">
					<Welcome isVisible={ showWelcome } closeAction={ this.closeWelcome } additionalClassName="NuxWelcome">
						<WelcomeMessage welcomeSite={ newestSite } />
					</Welcome>
					<InviteMessage sites={ this.props.sites }/>
					<EmailVerificationNotice user={ this.props.user } />
					<NoticesList id="notices" notices={ notices.list } forcePinned={ 'post' === this.state.section } />
					<GlobalNotices id="notices" />
					<TranslatorInvitation isVisible={ showInvitation } />
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
