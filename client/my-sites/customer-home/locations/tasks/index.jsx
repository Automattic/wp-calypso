/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelCta from 'components/action-panel/cta';
import ActionPanelFooter from 'components/action-panel/footer';
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import { savePreference } from 'state/preferences/actions';

class RecommendedTask extends Component {		
	render() {
		const { translate } = this.props;
		
		let taskName;
		let taskId;
		let taskImage;
		let taskDescription;
		let taskMinutes;
		let actionText;
		let actionLink;
		
		if ( 2 > 1 ) {
			taskName = translate( 'Connect social media accounts' );
			taskId = 'connect-social-media';
			taskImage = "/calypso/images/stats/tasks/social-links.svg";
			taskDescription = translate( 'Integrate your site with social media to automatically post your content and drive content to your site.' );
			taskMinutes = '5';
			actionText = translate( 'Connect accounts' );
		}
		
		const minuteOrMinutes = taskMinutes > 1 ? translate( 'minutes' ) : translate( 'minute' );
		
		return (
            <ActionPanel>
                <ActionPanelBody>
                    <ActionPanelFigure align="right">
                        <img
                            src={ taskImage }
                            alt=""
                        />
                    </ActionPanelFigure>
					<div>
						<Gridicon icon="time" />
						<p>{ taskMinutes + ' ' + minuteOrMinutes }
						</p>
					</div>
                    <ActionPanelTitle>{ taskName }</ActionPanelTitle>
                    <p>{ taskDescription }</p>
                    <ActionPanelCta>
                        <Button className="action-panel__support-button" primary href={ actionLink }>
							{ actionText }
                        </Button>
                        <Button className="action-panel__support-button is-link" href="/help/contact">
							{ translate( 'Skip for now' ) }
                        </Button>
                    </ActionPanelCta>
                </ActionPanelBody>
            </ActionPanel>
		);
	}
}

export default connect( state => {
	return {
		previousRoute: 2 > 1,
	};
} )( localize( RecommendedTask ) );
