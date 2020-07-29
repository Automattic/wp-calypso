/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { FEATURE_QUICK_START_VIDEO } from 'my-sites/customer-home/cards/constants';

/**
 * Style dependencies
 */
import quickStartVideoImage from 'assets/images/customer-home/quick-start-video-ss.png';
import './style.scss';

export const QuickStartVideo = ( { trackQuickStartImpression } ) => {
	const translate = useTranslate();

	useEffect( () => {
		trackQuickStartImpression();
	}, [ trackQuickStartImpression ] );

	return (
		<div className="quick-start-video">
			<h2 className="quick-start-video__heading customer-home__section-heading">
				{ translate( 'Watch this video to get started' ) }
			</h2>
			<Card>
				<div>
					<InlineSupportLink
						supportPostId={ 81083 }
						supportLink={ localizeUrl( 'https://wordpress.com/support/start/' ) }
						showIcon={ false }
						showText={ true }
						tracksEvent="calypso_customer_home_education"
						statsGroup="calypso_customer_home"
						tracksOptions={ {
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

const trackCardImpression = () => {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_card_impression', {
			card: FEATURE_QUICK_START_VIDEO,
		} ),
		bumpStat( 'calypso_customer_home_card_impression', FEATURE_QUICK_START_VIDEO )
	);
};

const mapDispatchToProps = {
	trackQuickStartImpression: trackCardImpression,
};

export default connect( null, mapDispatchToProps )( QuickStartVideo );
