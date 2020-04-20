/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';
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
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { savePreference } from 'state/preferences/actions';

/**
 * Style dependencies
 */
import './style.scss';

const ConnectAccountsTask = ( { skipTask, siteSlug } ) => {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( true );

	if ( ! isVisible ) {
		return null;
	}
	return (
		<ActionPanel className="tasks connect-accounts">
			<QueryPublicizeConnections selectedSite />
			<ActionPanelBody>
				{ ! isMobile() && (
					<ActionPanelFigure align="right">
						<img src="/calypso/images/stats/tasks/social-links.svg" alt="" />
					</ActionPanelFigure>
				) }
				<div className="tasks__timing">
					<Gridicon icon="time" size={ 18 } />
					<p>{ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }</p>
				</div>
				<ActionPanelTitle>{ translate( 'Drive traffic to your site' ) }</ActionPanelTitle>
				<p className="tasks__description">
					{ translate(
						'Integrate your site with social media to automatically post your content and drive traffic to your site.'
					) }
				</p>
				<ActionPanelCta>
					<Button
						className="tasks__action"
						primary
						href={
							isMobile()
								? `/marketing/connections/${ siteSlug }`
								: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`
						}
					>
						{ translate( 'Connect accounts' ) }
					</Button>
					<Button
						className="tasks__action-skip is-link"
						onClick={ () => {
							setIsVisible( false );
							skipTask();
						} }
					>
						{ translate( 'Skip for now' ) }
					</Button>
				</ActionPanelCta>
			</ActionPanelBody>
		</ActionPanel>
	);
};

const mapStateToProps = state => {
	return {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	};
};

const mapDispatchToProps = {
	skipTask: siteId =>
		savePreference( `dismissible-card-home-task-connect-accounts-${ siteId }`, true ),
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	return {
		...stateProps,
		skipTask: () => dispatchProps.skipTask( stateProps.siteId ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( ConnectAccountsTask );
