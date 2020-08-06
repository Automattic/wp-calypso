/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { FEATURE_QUICK_START_VIDEO } from 'my-sites/customer-home/cards/constants';
import MaterialIcon from 'components/material-icon';

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
				<div class="quick-start-video__content">
					<div className="quick-start-video__content-wrapper">
						<h3>{ translate( 'Video: Getting started on WordPress.com' ) }</h3>
						<p className="quick-start-video__content-description customer-home__card-subheader">
							{ translate(
								'This video tour of WordPress.com will show you everything you need to know to start building your website.'
							) }
						</p>
						<div className="quick-start-video__content-links">
							<div className="quick-start-video__content-link">
								<MaterialIcon icon="play_circle_outline" />
								<InlineSupportLink
									supportPostId={ 158974 }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/getting-started-with-wordpress-com/#video-getting-started-with-word-press-com'
									) }
									showIcon={ false }
									showText={ true }
									tracksEvent="calypso_customer_home_education"
									statsGroup="calypso_customer_home"
									tracksOptions={ {
										card_name: 'QuickStartVideo',
									} }
									statsName="QuickStartVideo"
								>
									{ translate( 'Watch the video' ) }
								</InlineSupportLink>
							</div>
						</div>
					</div>
					{ isDesktop() && (
						<div className="quick-start-video__content-illustration">
							<InlineSupportLink
								supportPostId={ 158974 }
								supportLink={ localizeUrl(
									'https://wordpress.com/support/getting-started-with-wordpress-com/#video-getting-started-with-word-press-com'
								) }
								showIcon={ false }
								showText={ true }
								tracksEvent="calypso_customer_home_education"
								statsGroup="calypso_customer_home"
								tracksOptions={ {
									card_name: 'QuickStartVideo',
								} }
								statsName="QuickStartVideo"
							>
								<img src={ quickStartVideoImage } alt="" width="186px" />
							</InlineSupportLink>
						</div>
					) }
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
