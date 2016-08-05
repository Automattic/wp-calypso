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

class TransferUnavailableCard extends Component {
	content() {
		const {
			isUnavailable,
			isOnVacation,
			premiumThemeIssue,
			customFontIssue,
			siteSlug,
			translate,
		} = this.props;

		if ( isUnavailable ) {
			return <div>
				<p>
					{ translate( `Woah! Our transfer truck is plum worn out. We're going
						to throw on a new set of tires and replace some of the other
						thingummies.` ) }
				</p><p>
					{ translate( `In the meantime, you can transfer your WordPress.com
							blog elsewhere by following {{a}}these steps{{/a}}. `,
						{ components: {
							a: <a href="http://en.support.wordpress.com/moving-a-blog/#moving-to-wordpress-org" />
						} } ) }
				</p><p>
					{ translate( `If you really need a Guided Transfer, hang in there!
							We'll be back soon.` ) }
				</p>
			</div>;
		}

		if ( isOnVacation ) {
			return <div>
				<p>
					{ translate( `Howdy! The Guided Transfer team has disappeared
						for a few days to a secret island lair to concoct new ways
						to make transfers one hundred billion percent better.` ) }
				</p><p>
					{ translate( `In the meantime, you can transfer your WordPress.com
						blog elsewhere by following {{a}}these steps{{/a}}.`,
						{ components: { a: <a href="http://en.support.wordpress.com/moving-a-blog/#moving-to-wordpress-org" /> } }
					) }
				</p><p>
					{ translate( "If you really need a Guided Transfer, hang in there! We'll be back soon." ) }
				</p>
			</div>;
		}

		if ( premiumThemeIssue || customFontIssue ) {
			return <div>
			<p>
				{ translate( `Howdy! It looks like there are some customizations to your site
					that can't be transferred.` ) }
			</p>
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
			<div className="guided-transfer__transfer-unavailable-icon">
				<Gridicon icon="shipping" size={ 72 } />
			</div>
			<div className="guided-transfer__transfer-unavailable-text">
				{ this.content() }
			</div>
		</Card>;
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	// We only want issues that completely block transfer
	isUnavailable: !! getGuidedTransferIssue( state, ownProps.siteId, { reason: 'unavailable' } ),
	isOnVacation: !! getGuidedTransferIssue( state, ownProps.siteId, { reason: 'vacation' } ),
	premiumThemeIssue: getGuidedTransferIssue( state, ownProps.siteId, { reason: 'premium-theme', prevents_transfer: true } ),
	customFontIssue: getGuidedTransferIssue( state, ownProps.siteId, { reason: 'custom-font', prevents_transfer: true } )
} );

export default connect( mapStateToProps )( localize( TransferUnavailableCard ) );
