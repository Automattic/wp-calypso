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
import quickStartVideoImage from 'assets/images/customer-home/quick-start-video-ss.png';
import './style.scss';

export const QuickStartVideo = () => {
	const translate = useTranslate();

	return (
		<div className="quick-start-video">
			<h2 className="quick-start-video__heading customer-home__section-heading">
				{ translate( 'Watch this video to get started' ) }
			</h2>
			<Card>
				<div>
					<InlineSupportLink
						supportPostId={ 4454 }
						supportLink={ localizeUrl( 'https://wordpress.com/support/stats/' ) }
						showIcon={ false }
						showText={ true }
						tracksEvent="calypso_customer_home_education"
						statsGroup="calypso_customer_home"
						tracksOptions={ {
							url,
							card_name: "QuickStartVideo",
						} }
						statsName="QuickStartVideo" 
					>
						<img src={ quickStartVideoImage } />
					</InlineSupportLink>
				</div>
			</Card>
		</div>
	);
};

export default QuickStartVideo;
