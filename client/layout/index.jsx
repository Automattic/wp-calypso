import { property, sortBy } from 'lodash';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

import MasterbarLoggedIn from 'layout/masterbar/logged-in';
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import observe from 'lib/mixins/data-observe';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import translator from 'lib/translator-jumpstart';
import TranslatorInvitation from './community-translator/invitation';
import TranslatorLauncher from './community-translator/launcher';
import Welcome from 'my-sites/welcome/welcome';
import WelcomeMessage from 'layout/nux-welcome/welcome-message';
import GuidedTours from 'layout/guided-tours';
import analytics from 'lib/analytics';
import config from 'config';
import PulsingDot from 'components/pulsing-dot';
import SitesListNotices from 'lib/sites-list/notices';
import OfflineStatus from 'layout/offline-status';
import QueryPreferences from 'components/data/query-preferences';

/**
 * Internal dependencies
 */
let KeyboardShortcutsMenu, Layout, SupportUser;

import QuerySites from 'components/data/query-sites';
import { isOffline } from 'state/application/selectors';
import { hasSidebar } from 'state/ui/selectors';
import { isHappychatOpen } from 'state/ui/happychat/selectors';
import SitePreview from 'blocks/site-preview';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import DocumentHead from 'components/data/document-head';
import NpsSurveyNotice from 'layout/nps-survey-notice';
import AppBanner from 'blocks/app-banner';

if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
	KeyboardShortcutsMenu = require( 'lib/keyboard-shortcuts/menu' );
}

if ( config.isEnabled( 'support-user' ) ) {
	SupportUser = require( 'support/support-user' );
}

Layout = createReactClass( {
	displayName: 'Layout',

	mixins: [ SitesListNotices, observe( 'user', 'nuxWelcome', 'translatorInvitation' ) ],

	propTypes: {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		user: PropTypes.object,
		nuxWelcome: PropTypes.object,
		translatorInvitation: PropTypes.object,
		focus: PropTypes.object,
		// connected props
		isLoading: PropTypes.bool,
		isSupportUser: PropTypes.bool,
		section: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object,
		] ),
		isOffline: PropTypes.bool,
	},

	closeWelcome: function() {
		this.props.nuxWelcome.closeWelcome();
		analytics.ga.recordEvent( 'Welcome Box', 'Clicked Close Button' );
	},

	newestSite: function() {
		return sortBy( this.props.sites, property( 'ID' ) ).pop();
	},

	renderMasterbar: function() {
		if ( ! this.props.user ) {
			return <MasterbarLoggedOut sectionName={ this.props.section.name } />;
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

		return (
			<span>
				<Welcome isVisible={ showWelcome } closeAction={ this.closeWelcome } additionalClassName="NuxWelcome">
					<WelcomeMessage welcomeSite={ newestSite } />
				</Welcome>
				<TranslatorInvitation isVisible={ showInvitation } />
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
				`is-group-${ this.props.section.group }`,
				`is-section-${ this.props.section.name }`,
				`focus-${ this.props.currentLayoutFocus }`,
				{ 'is-support-user': this.props.isSupportUser },
				{ 'has-no-sidebar': ! this.props.hasSidebar },
				{ 'wp-singletree-layout': !! this.props.primary },
				{ 'has-chat': this.props.chatIsOpen }
			),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.props.isLoading
			} );

		return (
			<div className={ sectionClass }>
				<DocumentHead />
				<QuerySites allSites />
				<QueryPreferences />
				{ <GuidedTours /> }
				{ config.isEnabled( 'nps-survey/notice' ) && <NpsSurveyNotice /> }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<div className={ loadingClass } ><PulsingDot active={ this.props.isLoading } chunkName={ this.props.section.name } /></div>
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ this.renderWelcome() }
					<GlobalNotices id="notices" notices={ notices.list } forcePinned={ 'post' === this.props.section.name } />
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
					<div id="secondary" className="layout__secondary">
						{ this.props.secondary }
					</div>
				</div>
				<TranslatorLauncher
					isEnabled={ translator.isEnabled() }
					isActive={ translator.isActivated() } />
				{ this.renderPreview() }
				{ config.isEnabled( 'happychat' ) && this.props.chatIsOpen && <AsyncLoad require="components/happychat" /> }
				{ 'development' === process.env.NODE_ENV && <AsyncLoad require="components/webpack-build-monitor" /> }
				<AppBanner />
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
