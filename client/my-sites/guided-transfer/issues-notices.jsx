/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getGuidedTransferIssue } from 'calypso/state/sites/guided-transfer/selectors';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';

/**
 * This implements a list of notices for warnings which *don't prevent a transfer*.
 * These appear above the host details entry as warning notices.
 * For *blocking* issues, see transfer-unavailable-card.jsx
 */
class IssuesNotices extends Component {
	render() {
		const { premiumThemeIssue, customFontIssue, siteSlug, translate } = this.props;

		return (
			<div className="guided-transfer__issues-notices">
				{ premiumThemeIssue && ! premiumThemeIssue.prevents_transfer && (
					<Notice status="is-warning" showDismiss={ false }>
						{ translate(
							"Your site uses a Premium Theme that can't be transferred. Continuing will automatically activate the default theme, or you can {{a}}choose a free theme{{/a}}.",
							{ components: { a: <a href={ `/themes/free/${ siteSlug }` } /> } }
						) }
					</Notice>
				) }

				{ customFontIssue && ! customFontIssue.prevents_transfer && (
					<Notice status="is-warning" showDismiss={ false }>
						{ translate(
							"Your site uses a custom font that can't be transferred. Continuing will automatically activate the default font, or you can {{a}}choose a free theme{{/a}}.",
							{ components: { a: <a href={ `/themes/free/${ siteSlug }` } /> } }
						) }
					</Notice>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	premiumThemeIssue: getGuidedTransferIssue( state, ownProps.siteId, {
		reason: 'premium-theme',
		prevents_transfer: false,
	} ),
	customFontIssue: getGuidedTransferIssue( state, ownProps.siteId, {
		reason: 'custom-font',
		prevents_transfer: false,
	} ),
} );

export default connect( mapStateToProps )( localize( IssuesNotices ) );
