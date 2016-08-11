/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getGuidedTransferIssue } from 'state/sites/guided-transfer/selectors';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';

class TransferUnavailableCard extends Component {
	content() {
		const {
			premiumThemeIssue,
			customFontIssue,
			siteSlug,
			translate,
		} = this.props;

		if ( premiumThemeIssue || customFontIssue ) {
			return <div>
				<Notice status="is-warning" showDismiss={ false }>
					{ translate( `It looks like there are some customizations to your site
						that can't be transferred.` ) }
				</Notice>
				<ul>
					{ premiumThemeIssue && <li>
						{ translate( `Your site uses a Premium Theme that can't be
								transferred. Please {{a}}choose a free theme{{/a}}
								to continue.`,
								{ components: { a: <a href={ `/design/free/${ siteSlug }` } /> } } ) }
					</li> }
					{ customFontIssue && <li>
						{ translate( `Your site uses a custom font that can't be
								transferred. Please switch your custom fonts back to your theme's
								default fonts if you would like to proceed.`,
								{ components: { a: <a href={ `/design/free/${ siteSlug }` } /> } } ) }
					</li> }
				</ul>
			</div>;
		}

		// Fallback for unknown issue - user should never see this
		return <div>
			<p>{ translate( `Howdy! It looks like there's something stopping us from being able
			to transfer your site. Please contact support and we'll sort it out!` ) }</p>
		</div>;
	}

	render() {
		return <Card className="guided-transfer__transfer-unavailable-card">
			{ this.content() }
		</Card>;
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	// We only want issues that completely block transfer
	premiumThemeIssue: getGuidedTransferIssue( state, ownProps.siteId, { reason: 'premium-theme', prevents_transfer: true } ),
	customFontIssue: getGuidedTransferIssue( state, ownProps.siteId, { reason: 'custom-font', prevents_transfer: true } )
} );

export default connect( mapStateToProps )( localize( TransferUnavailableCard ) );
