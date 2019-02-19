/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import MasterbarLoggedIn from 'layout/masterbar/logged-in';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import TranslatorLauncher from './community-translator/launcher';
import config from 'config';
import PulsingDot from 'components/pulsing-dot';
import OfflineStatus from 'layout/offline-status';
import QueryPreferences from 'components/data/query-preferences';
import QuerySites from 'components/data/query-sites';
import QuerySiteSelectedEditor from 'components/data/query-site-selected-editor';
import { isOffline } from 'state/application/selectors';
import {
	getSelectedSiteId,
	hasSidebar,
	masterbarIsVisible,
	getSectionGroup,
	getSectionName,
	isSectionLoading,
} from 'state/ui/selectors';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import { isSupportSession } from 'state/support/selectors';
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
import BodySectionCssClass from './body-section-css-class';

class Layout extends Component {
	static displayName = 'Layout';
	static propTypes = {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		focus: PropTypes.object,
		// connected props
		masterbarIsHidden: PropTypes.bool,
		isLoading: PropTypes.bool,
		isSupportSession: PropTypes.bool,
		isOffline: PropTypes.bool,
		sectionGroup: PropTypes.string,
		sectionName: PropTypes.string,
		colorSchemePreference: PropTypes.string,
	};

	componentDidMount() {
		if ( ! config.isEnabled( 'me/account/color-scheme-picker' ) ) {
			return;
		}
		if ( typeof document !== 'undefined' ) {
			if ( this.props.colorSchemePreference ) {
				document
					.querySelector( 'body' )
					.classList.add( `is-${ this.props.colorSchemePreference }` );
			}
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! config.isEnabled( 'me/account/color-scheme-picker' ) ) {
			return;
		}
		if ( prevProps.colorSchemePreference === this.props.colorSchemePreference ) {
			return;
		}
		if ( typeof document !== 'undefined' ) {
			const classList = document.querySelector( 'body' ).classList;
			classList.remove( `is-${ prevProps.colorSchemePreference }` );
			classList.add( `is-${ this.props.colorSchemePreference }` );
		}

		// intentionally don't remove these in unmount
	}

	render() {
		const sectionClass = classnames(
				'layout',
				`is-group-${ this.props.sectionGroup }`,
				`is-section-${ this.props.sectionName }`,
				`focus-${ this.props.currentLayoutFocus }`,
				{ 'is-support-session': this.props.isSupportSession },
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
				<BodySectionCssClass group={ this.props.sectionGroup } section={ this.props.sectionName } />
				<DocumentHead />
				<QuerySites primaryAndRecent />
				<QuerySites allSites />
				<QueryPreferences />
				<QuerySiteSelectedEditor siteId={ this.props.siteId } />
				<AsyncLoad require="layout/guided-tours" placeholder={ null } />
				{ config.isEnabled( 'nps-survey/notice' ) && ! isE2ETest() && <NpsSurveyNotice /> }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				<MasterbarLoggedIn
					section={ this.props.sectionGroup }
					compact={ this.props.sectionName === 'checkout' }
				/>
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<div className={ loadingClass }>
					{ this.props.isLoading && <PulsingDot delay={ 400 } active /> }
				</div>
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ config.isEnabled( 'jitms' ) && <JITM /> }
					<GlobalNotices
						id="notices"
						notices={ notices.list }
						forcePinned={ 'post' === this.props.sectionName }
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
				{ this.props.sectionGroup === 'sites' && <SitePreview /> }
				{ config.isEnabled( 'happychat' ) && this.props.chatIsOpen && (
					<AsyncLoad require="components/happychat" />
				) }
				{ 'development' === process.env.NODE_ENV && (
					<AsyncLoad require="components/webpack-build-monitor" placeholder={ null } />
				) }
				{ ( 'jetpack-connect' !== this.props.sectionName ||
					this.props.currentRoute === '/jetpack/new' ) &&
					this.props.currentRoute !== '/log-in/jetpack' && (
						<AsyncLoad require="blocks/inline-help" placeholder={ null } />
					) }
				<SupportArticleDialog />
				<AppBanner />
				{ config.isEnabled( 'gdpr-banner' ) && <GdprBanner /> }
			</div>
		);
	}
}

export default connect( state => {
	const sectionGroup = getSectionGroup( state );
	const sectionName = getSectionName( state );
	return {
		masterbarIsHidden: ! masterbarIsVisible( state ) || 'signup' === sectionName,
		isLoading: isSectionLoading( state ),
		isSupportSession: isSupportSession( state ),
		sectionGroup,
		sectionName,
		hasSidebar: hasSidebar( state ),
		isOffline: isOffline( state ),
		currentLayoutFocus: getCurrentLayoutFocus( state ),
		chatIsOpen: isHappychatOpen( state ),
		colorSchemePreference: getPreference( state, 'colorScheme' ),
		currentRoute: getCurrentRoute( state ),
		siteId: getSelectedSiteId( state ),
	};
} )( Layout );
