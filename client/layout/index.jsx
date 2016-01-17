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
var MasterbarLoggedIn = require( 'layout/masterbar/logged-in' ),
	observe = require( 'lib/mixins/data-observe' ),
	GlobalNotices = require( 'components/global-notices' ),
	notices = require( 'notices' ),
	translator = require( 'lib/translator-jumpstart' ),
	TranslatorInvitation = require( './community-translator/invitation' ),
	TranslatorLauncher = require( './community-translator/launcher' ),
	EmailVerificationNotice = require( 'components/email-verification/email-verification-notice' ),
	Welcome = require( 'my-sites/welcome/welcome' ),
	WelcomeMessage = require( 'nux-welcome/welcome-message' ),
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	connect = require( 'react-redux' ).connect,
	PulsingDot = require( 'components/pulsing-dot' ),
	SitesListNotices = require( 'lib/sites-list/notices' ),
	PollerPool = require( 'lib/data-poller' ),
	KeyboardShortcutsMenu,
	SupportUser,
	Layout;

if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
	KeyboardShortcutsMenu = require( 'lib/keyboard-shortcuts/menu' );
}

if ( config.isEnabled( 'support-user' ) ) {
	SupportUser = require( 'components/support-user' );
}

Layout = React.createClass( {
	displayName: 'Layout',

	mixins: [ SitesListNotices, observe( 'user', 'focus', 'nuxWelcome', 'sites', 'translatorInvitation' ) ],

	_sitesPoller: null,

	componentWillUpdate: function( nextProps ) {
		if ( this.props.section !== nextProps.section ) {
			if ( nextProps.section === 'sites' ) {
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

	render: function() {
		var sectionClass = 'wp layout is-section-' + this.props.section + ' focus-' + this.props.focus.getCurrent(),
			showWelcome = this.props.nuxWelcome.getWelcome(),
			newestSite = this.newestSite(),
			translatorInvitation = this.props.translatorInvitation,
			showInvitation = ! showWelcome &&
				translatorInvitation.isPending() &&
				translatorInvitation.isValidSection( this.props.section ),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.props.isLoading
			} );

		if ( ! this.props.hasSidebar ) {
			sectionClass += ' has-no-sidebar';
		}

		return (
			<div className={ sectionClass }>
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ config.isEnabled( 'support-user' ) ? <SupportUser /> : null }
				<MasterbarLoggedIn user={ this.props.user } section={ this.props.section } sites={ this.props.sites } />
				<div className={ loadingClass } ><PulsingDot active={ this.props.isLoading } /></div>
				<div id="content" className="wp-content">
					<Welcome isVisible={ showWelcome } closeAction={ this.closeWelcome } additionalClassName="NuxWelcome">
						<WelcomeMessage welcomeSite={ newestSite } />
					</Welcome>
					<EmailVerificationNotice user={ this.props.user } />
					<GlobalNotices id="notices" notices={ notices.list } forcePinned={ 'post' === this.props.section } />
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

export default connect(
	( state ) => {
		const { isLoading, section, hasSidebar } = state.ui;
		return { isLoading, section, hasSidebar };
	}
)( Layout );
