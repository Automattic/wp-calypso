/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelCta from 'components/action-panel/cta';
import Gridicon from 'components/gridicon';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getConnectionsBySiteId } from 'state/sharing/publicize/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class RecommendedTask extends Component {
	render() {
		const { hideSocialTask, siteId, siteSlug, translate } = this.props;

		if ( hideSocialTask ) {
			return null;
		}

		let taskName;
		let taskId;
		let taskImage;
		let taskDescription;
		let taskMinutes;
		let actionText;
		let actionLink;
		let shouldQueryPublicizeConnections;

		if ( ! hideSocialTask ) {
			taskName = translate( 'Connect social media accounts' );
			taskId = 'SocialMedia';
			taskImage = '/calypso/images/stats/tasks/social-links.svg';
			taskDescription = translate(
				'Integrate your site with social media to automatically post your content and drive content to your site.'
			);
			taskMinutes = '3';
			actionText = translate( 'Connect accounts' );
			actionLink = isMobile()
				? `/marketing/connections/${ siteSlug }`
				: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`;
			shouldQueryPublicizeConnections = true;
		}

		const minuteOrMinutes =
			taskMinutes > 1
				? translate( 'minutes', {
						comment: 'eg. 5 minutes to complete a task',
				  } )
				: translate( 'minute', {
						comment: 'eg. 1 minute to complete a task',
						context: 'noun',
				  } );
		return (
			<ActionPanel className="tasks">
				{ shouldQueryPublicizeConnections && <QueryPublicizeConnections selectedSite /> }
				<ActionPanelBody>
					{ ! isMobile() && (
						<ActionPanelFigure align="right">
							<img src={ taskImage } alt="" />
						</ActionPanelFigure>
					) }
					<div className="tasks__timing">
						<Gridicon icon="time" size={ 18 } />
						<p>{ taskMinutes + ' ' + minuteOrMinutes }</p>
					</div>
					<ActionPanelTitle>{ taskName }</ActionPanelTitle>
					<p className="tasks__description">{ taskDescription }</p>
					<ActionPanelCta>
						<Button className="tasks__action" primary href={ actionLink }>
							{ actionText }
						</Button>
						<Button
							className="tasks__action-skip is-link"
							onClick={ () => {
								this.props.skipTask( 'homeTask' + taskId + siteId, true );
							} }
						>
							{ translate( 'Skip for now' ) }
						</Button>
					</ActionPanelCta>
				</ActionPanelBody>
			</ActionPanel>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		hideSocialTask:
			getPreference( state, 'homeTaskSocialMedia' + siteId ) ||
			getConnectionsBySiteId( state, siteId ).length > 0,
	};
};

const mapDispatchToProps = {
	skipTask: savePreference,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( RecommendedTask ) );
