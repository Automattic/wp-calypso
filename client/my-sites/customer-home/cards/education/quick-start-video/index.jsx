/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
// import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
//import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export const QuickStartVid = () => {
	const translate = useTranslate();

	return (
		<div className="quick-start-video">
			<h2 className="quick-start-video__heading customer-home__section-heading">
				{ translate( 'Stats at a glance' ) }
			</h2>
			<Card>
				<div>
					{ translate( 'Launch your site to see a snapshot of traffic and insights.' ) }
					<InlineSupportLink
						supportPostId={ 4454 }
						supportLink={ localizeUrl( 'https://wordpress.com/support/stats/' ) }
						showIcon={ false }
						text={ translate( 'Learn about stats.' ) }
						tracksEvent="calypso_customer_home_stats_support_page_view"
						statsGroup="calypso_customer_home"
						statsName="stats_learn_more"
					/>
				</div>
			</Card>
		</div>
	);
};

// const mapStateToProps = ( state ) => {
// 	// const siteId = getSelectedSiteId( state );
// 	// const siteSlug = getSelectedSiteSlug( state );
// 	const isSiteUnlaunched = isUnlaunchedSite( state, siteId );

// 	return {
// 		// isSiteUnlaunched,
// 		// siteId,
// 		// siteSlug,
// 	};
// };

export default QuickStartVid;
