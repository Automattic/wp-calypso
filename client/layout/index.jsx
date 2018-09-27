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
import AsyncLoad from 'components/async-load';
import MasterbarLoggedIn from 'layout/masterbar/logged-in';
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
/* eslint-disable no-restricted-imports */
import observe from 'lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import TranslatorLauncher from './community-translator/launcher';
import config from 'config';
import PulsingDot from 'components/pulsing-dot';
import OfflineStatus from 'layout/offline-status';
import QueryPreferences from 'components/data/query-preferences';

/**
 * Internal dependencies
 */
import PropTypes from 'prop-types';
import QuerySites from 'components/data/query-sites';
import { isOffline } from 'state/application/selectors';
import { hasSidebar, masterbarIsVisible } from 'state/ui/selectors';
import InlineHelp from 'blocks/inline-help';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import SitePreview from 'blocks/site-preview';
import SupportArticleDialog from 'blocks/support-article-dialog';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import DocumentHead from 'components/data/document-head';
import NpsSurveyNotice from 'layout/nps-survey-notice';
import AppBanner from 'blocks/app-banner';
import GdprBanner from 'blocks/gdpr-banner';
import { getPreference } from 'state/preferences/selectors';
import JITM from 'blocks/jitm';
import KeyboardShortcutsMenu from 'lib/keyboard-shortcuts/menu';
import SupportUser from 'support/support-user';
import { isCommunityTranslatorEnabled } from 'components/community-translator/utils';
import { isE2ETest } from 'lib/e2e';

/* eslint-disable react/no-deprecated */
const Layout = createReactClass( {
	/* eslint-enable react/no-deprecated */
	displayName: 'Layout',

	mixins: [ observe( 'user' ) ],

	propTypes: {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		user: PropTypes.object,
		focus: PropTypes.object,
		// connected props
		masterbarIsHidden: PropTypes.bool,
		isLoading: PropTypes.bool,
		isSupportUser: PropTypes.bool,
		section: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		isOffline: PropTypes.bool,
		colorSchemePreference: PropTypes.string,
	},

	newestSite: function() {
		return sortBy( this.props.sites, property( 'ID' ) ).pop();
	},

	renderMasterbar: function() {
		if ( ! this.props.user || /^\/start\/user-continue\//.test( this.props.currentRoute ) ) {
			return <MasterbarLoggedOut sectionName={ this.props.section.name } />;
		}

		return (
			<MasterbarLoggedIn
				user={ this.props.user }
				section={ this.props.section.group }
				sites={ this.props.sites }
				compact={ this.props.section.name === 'checkout' }
			/>
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
				{ 'has-chat': this.props.chatIsOpen },
				{ 'has-no-masterbar': this.props.masterbarIsHidden }
			),
			loadingClass = classnames( {
				layout__loader: true,
				'is-active': this.props.isLoading,
			} );

		return (
			<div className={ sectionClass }>
				<DocumentHead />
				<QuerySites primaryAndRecent />
				<QuerySites allSites />
				<QueryPreferences />
				<AsyncLoad require="layout/guided-tours" placeholder={ null } />
				{ config.isEnabled( 'nps-survey/notice' ) && ! isE2ETest() && <NpsSurveyNotice /> }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<div className={ loadingClass }>
					<PulsingDot active={ this.props.isLoading } />
				</div>
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ config.isEnabled( 'jitms' ) && <JITM /> }
					<GlobalNotices
						id="notices"
						notices={ notices.list }
						forcePinned={ 'post' === this.props.section.name }
					/>

					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
				{ config.isEnabled( 'i18n/community-translator' ) ? (
					isCommunityTranslatorEnabled() && <AsyncLoad require="components/community-translator" />
				) : (
					<TranslatorLauncher />
				) }
				{ this.renderPreview() }
				{ config.isEnabled( 'happychat' ) &&
					this.props.chatIsOpen && <AsyncLoad require="components/happychat" /> }
				{ 'development' === process.env.NODE_ENV && (
					<AsyncLoad require="components/webpack-build-monitor" placeholder={ null } />
				) }
				{ ( 'jetpack-connect' !== this.props.section.name ||
					this.props.currentRoute === '/jetpack/new' ) &&
					this.props.currentRoute !== '/log-in/jetpack' && <InlineHelp /> }
				<SupportArticleDialog />
				<AppBanner />
				{ config.isEnabled( 'gdpr-banner' ) && <GdprBanner /> }
			</div>
		);
	},
} );

export default connect( state => {
	const { isLoading, section } = state.ui;
	return {
		masterbarIsHidden: ! masterbarIsVisible( state ),
		isLoading,
		isSupportUser: state.support.isSupportUser,
		section,
		hasSidebar: hasSidebar( state ),
		isOffline: isOffline( state ),
		currentLayoutFocus: getCurrentLayoutFocus( state ),
		chatIsOpen: isHappychatOpen( state ),
		colorSchemePreference: getPreference( state, 'colorScheme' ),
		currentRoute: getCurrentRoute( state ),
	};
} )( Layout );
