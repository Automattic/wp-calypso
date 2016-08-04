/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { hasGuidedTransferIssue } from 'state/sites/guided-transfer/selectors';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

class Issues extends Component {
	render() {
		const {
			isGuidedTransferUnavailable,
			translate,
		} = this.props;

		return <div class="guided-transfer__issues-list">
			{ isGuidedTransferUnavailable &&
				<Notice status="is-error" showDismiss={ false }>
					{ translate( `Woah! Our transfer truck is plum worn out. We're going
					to throw on a new set of tires and replace some of the other
					thingummies.` ) }
					<br/><br/>
					{ translate( `In the meantime, you can transfer your WordPress.com
						blog elsewhere by following {{a}}these steps{{/a}}. `,
					{ components: {
						a: <a href="http://en.support.wordpress.com/moving-a-blog/#moving-to-wordpress-org" />
					} } ) }
					<br/><br/>
					{ translate( `If you really need a Guided Transfer, hang in there!
						We'll be back soon.` ) }
				</Notice>
			}
		</div>;
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	isGuidedTransferUnavailable: hasGuidedTransferIssue( state, ownProps.siteId, 'unavailable' )
} );

export default connect( mapStateToProps )( localize( Issues ) );
