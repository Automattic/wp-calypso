/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import ExternalLink from 'components/external-link';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getJetpackConnectionStatus, isJetpackSiteInDevelopmentMode } from 'state/selectors';

class JetpackDevModeNotice extends Component {
	renderNotice() {
		const { devMode, isJetpackSiteInDevMode, translate } = this.props;
		const helpUrl = 'https://jetpack.com/support/development-mode/';
		const textOptions = {
			components: {
				a: <ExternalLink href={ helpUrl } target="_blank" />
			}
		};
		let text;

		if ( ! isJetpackSiteInDevMode ) {
			return null;
		}

		if ( devMode.filter ) {
			text = translate(
				'Some features are currently disabled because this site is in {{a}}Development Mode{{/a}} ' +
				'via the jetpack_development_mode filter.',
				textOptions
			);
		} else if ( devMode.constant ) {
			text = translate(
				'Some features are currently disabled because this site is in {{a}}Development Mode{{/a}} ' +
				'via the JETPACK_DEV_DEBUG constant.',
				textOptions
			);
		} else if ( devMode.url ) {
			text = translate(
				'Some features are currently disabled because this site is in {{a}}Development Mode{{/a}} ' +
				'since the URL lacks a dot (e.g. http://localhost).',
				textOptions
			);
		}

		return (
			<Notice
				text={ text }
				status="is-info"
				showDismiss={ false }
			>
				<NoticeAction href={ helpUrl } external>
					{ translate( 'Learn more' ) }
				</NoticeAction>
			</Notice>
		);
	}

	render() {
		const { siteId } = this.props;
		return (
			<div>
				<QueryJetpackConnection siteId={ siteId } />
				{ this.renderNotice() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const connectionStatus = getJetpackConnectionStatus( state, siteId );

		return {
			siteId,
			devMode: connectionStatus && connectionStatus.devMode,
			isJetpackSiteInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
		};
	}
)( localize( JetpackDevModeNotice ) );
