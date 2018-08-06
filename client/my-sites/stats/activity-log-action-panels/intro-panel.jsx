/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';
/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel/index';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelFooter from 'components/action-panel/footer';
import Button from 'components/button/index';
import { isJetpackSite } from 'state/sites/selectors';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

const PREFERENCE_NAME = 'dismissible-card-activity-log-intro';

class IntroPanel extends Component {
	getDescription() {
		const { translate, isJetpack } = this.props;
		return isJetpack
			? translate(
					"Stay informed of all your site's activity ranging from plugin and theme updates " +
						'to user logins and settings modifications.'
			  )
			: translate(
					"Stay informed of all your site's activity ranging from published or updated posts and pages " +
						'to published comments and settings modifications.'
			  );
	}
	render() {
		const { isDismissed, translate, dismissCard } = this.props;
		if ( isDismissed ) {
			return null;
		}
		return (
			<div className="activity-log-action-panels__intro">
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure inlineBodyText={ true }>
							<img
								src="/calypso/images/illustrations/activity-log-header.svg"
								width="170"
								height="143"
								alt=""
							/>
						</ActionPanelFigure>
						<ActionPanelTitle>{ translate( "Explore your site's activity" ) }</ActionPanelTitle>
						<p>{ this.getDescription() }</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button primary onClick={ dismissCard }>
							{ translate( 'Got it' ) }
						</Button>
					</ActionPanelFooter>
				</ActionPanel>
			</div>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isJetpack: isJetpackSite( state, siteId ),
		siteId: siteId,
		isDismissed: getPreference( state, PREFERENCE_NAME ),
	} ),
	dispatch =>
		bindActionCreators(
			{
				dismissCard: () => savePreference( PREFERENCE_NAME, true ),
			},
			dispatch
		)
)( localize( IntroPanel ) );
