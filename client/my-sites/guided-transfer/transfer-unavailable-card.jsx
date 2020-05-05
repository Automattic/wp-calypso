/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { getGuidedTransferIssue } from 'state/sites/guided-transfer/selectors';
import { Card } from '@automattic/components';
import Notice from 'components/notice';
import { CALYPSO_CONTACT } from 'lib/url/support';

const Issue = ( props ) => (
	<li className="guided-transfer__issue">
		<div className="guided-transfer__issue-title">
			<Gridicon icon="cross" size={ 18 } className="guided-transfer__issue-icon" />
			{ props.title }
		</div>
		<div className="guided-transfer__issue-description">{ props.children }</div>
	</li>
);

class TransferUnavailableCard extends Component {
	content() {
		const { premiumThemeIssue, customFontIssue, siteSlug, translate } = this.props;

		if ( premiumThemeIssue || customFontIssue ) {
			return (
				<div>
					<Notice status="is-warning" showDismiss={ false }>
						{ translate(
							"It looks like there are some customizations to your site that can't be transferred."
						) }
					</Notice>
					<ul>
						{ premiumThemeIssue && (
							<Issue title={ translate( 'Your site uses a Premium Theme' ) }>
								{ translate(
									"Premium Themes can't be transferred to an external site. Please {{a}}choose a free theme{{/a}} to continue.",
									{ components: { a: <a href={ `/themes/free/${ siteSlug }` } /> } }
								) }
							</Issue>
						) }
						{ customFontIssue && (
							<Issue title={ translate( 'Your site uses a custom font' ) }>
								{ translate(
									"Custom fonts can't be transferred to an external site. Please {{a}}switch back to your theme's default fonts{{/a}} if you would like to proceed.",
									{ components: { a: <a href={ `/customize/fonts/${ siteSlug }` } /> } }
								) }
							</Issue>
						) }
					</ul>
				</div>
			);
		}

		// Fallback for unknown issue - user should never see this
		return (
			<div>
				<p>
					{ translate(
						"Howdy! It looks like there's something stopping us from being able to transfer your site. Please {{a}}contact support{{/a}} and we'll sort it out!",
						{ components: { a: <a href={ CALYPSO_CONTACT } /> } }
					) }
				</p>
			</div>
		);
	}

	render() {
		return <Card className="guided-transfer__transfer-unavailable-card">{ this.content() }</Card>;
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	// We only want issues that completely block transfer
	premiumThemeIssue: getGuidedTransferIssue( state, ownProps.siteId, {
		reason: 'premium-theme',
		prevents_transfer: true,
	} ),
	customFontIssue: getGuidedTransferIssue( state, ownProps.siteId, {
		reason: 'custom-font',
		prevents_transfer: true,
	} ),
} );

export default connect( mapStateToProps )( localize( TransferUnavailableCard ) );
