/** @format */

/**
 * External dependencies
 */

import { property, sortBy } from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'client/components/async-load';
import MasterbarLoggedIn from 'client/layout/masterbar/logged-in';
import MasterbarLoggedOut from 'client/layout/masterbar/logged-out';
/* eslint-disable no-restricted-imports */
import observe from 'client/lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */
import GlobalNotices from 'client/components/global-notices';
import notices from 'client/notices';
import translator from 'client/lib/translator-jumpstart';
import TranslatorInvitation from './community-translator/invitation';
import TranslatorLauncher from './community-translator/launcher';
import Welcome from 'client/my-sites/welcome/welcome';
import WelcomeMessage from 'client/layout/nux-welcome/welcome-message';
import GuidedTours from 'client/layout/guided-tours';
import analytics from 'client/lib/analytics';
import config from 'config';
import PulsingDot from 'client/components/pulsing-dot';
import SitesListNotices from 'client/lib/sites-list/notices';
import OfflineStatus from 'client/layout/offline-status';
import QueryPreferences from 'client/components/data/query-preferences';

/**
 * Internal dependencies
 */
let KeyboardShortcutsMenu, SupportUser;

import PropTypes from 'prop-types';
import QuerySites from 'client/components/data/query-sites';
import { isOffline } from 'client/state/application/selectors';
import { hasSidebar } from 'client/state/ui/selectors';
import isHappychatOpen from 'client/state/happychat/selectors/is-happychat-open';
import SitePreview from 'client/blocks/site-preview';
import { getCurrentLayoutFocus } from 'client/state/ui/layout-focus/selectors';
import DocumentHead from 'client/components/data/document-head';
import NpsSurveyNotice from 'client/layout/nps-survey-notice';
import AppBanner from 'client/blocks/app-banner';
import { getPreference } from 'client/state/preferences/selectors';
import JITM from 'client/blocks/jitm';

if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
	KeyboardShortcutsMenu = require( 'lib/keyboard-shortcuts/menu' );
}

if ( config.isEnabled( 'support-user' ) ) {
	SupportUser = require( 'support/support-user' );
}
/* eslint-disable react/no-deprecated */
const Layout = createReactClass( {
	/* eslint-enable react/no-deprecated */
	displayName: 'Layout',

	mixins: [ observe( 'user', 'nuxWelcome', 'translatorInvitation' ) ],

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
		section: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		isOffline: PropTypes.bool,
		colorSchemePreference: PropTypes.string,
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
				sites={ this.props.sites }
			/>
		);
	},

	renderWelcome: function() {
		const translatorInvitation = this.props.translatorInvitation;

		if ( ! this.props.user ) {
			return null;
		}

		const showWelcome = this.props.nuxWelcome.getWelcome();
		const newestSite = this.newestSite();
		const showInvitation =
			! showWelcome &&
			translatorInvitation.isPending() &&
			translatorInvitation.isValidSection( this.props.section.name );

		return (
			<span>
				<Welcome
					isVisible={ showWelcome }
					closeAction={ this.closeWelcome }
					additionalClassName="NuxWelcome"
				>
					<WelcomeMessage welcomeSite={ newestSite } />
				</Welcome>
				<TranslatorInvitation isVisible={ showInvitation } />
			</span>
		);
	},

	renderPreview() {
		if ( config.isEnabled( 'preview-layout' ) && this.props.section.group === 'sites' ) {
			return <SitePreview />;
		}
	},

	render: function() {
		const sectionClass = classnames(
				'layout',
				'color-scheme',
				`is-${ this.props.colorSchemePreference }`,
				`is-group-${ this.props.section.group }`,
				`is-section-${ this.props.section.name }`,
				`focus-${ this.props.currentLayoutFocus }`,
				{ 'is-support-user': this.props.isSupportUser },
				{ 'has-no-sidebar': ! this.props.hasSidebar },
				{ 'has-chat': this.props.chatIsOpen }
			),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.props.isLoading,
			} );

		return (
			<div className={ sectionClass }>
				<DocumentHead />
				<SitesListNotices />
				<QuerySites allSites />
				<QueryPreferences />
				{ <GuidedTours /> }
				{ config.isEnabled( 'nps-survey/notice' ) && <NpsSurveyNotice /> }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<div className={ loadingClass }>
					<PulsingDot active={ this.props.isLoading } chunkName={ this.props.section.name } />
				</div>
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ config.isEnabled( 'jitms' ) && <JITM /> }
					{ this.renderWelcome() }
					<GlobalNotices
						id="notices"
						notices={ notices.list }
						forcePinned={ 'post' === this.props.section.name }
					/>

					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
					<div id="secondary" className="layout__secondary">
						{ this.props.secondary }
					</div>
				</div>
				<TranslatorLauncher
					isEnabled={ translator.isEnabled() }
					isActive={ translator.isActivated() }
				/>
				{ this.renderPreview() }
				{ config.isEnabled( 'happychat' ) &&
					this.props.chatIsOpen && <AsyncLoad require="components/happychat" /> }
				{ 'development' === process.env.NODE_ENV && (
					<AsyncLoad require="components/webpack-build-monitor" placeholder={ null } />
				) }
				<AppBanner />
			</div>
		);
	},
} );

export default connect( state => {
	const { isLoading, section } = state.ui;
	return {
		isLoading,
		isSupportUser: state.support.isSupportUser,
		section,
		hasSidebar: hasSidebar( state ),
		isOffline: isOffline( state ),
		currentLayoutFocus: getCurrentLayoutFocus( state ),
		chatIsOpen: isHappychatOpen( state ),
		colorSchemePreference: getPreference( state, 'colorScheme' ),
	};
} )( Layout );
