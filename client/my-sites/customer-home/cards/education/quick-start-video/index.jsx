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
import InlineSupportLink from 'calypso/components/inline-support-link';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { FEATURE_QUICK_START_VIDEO } from 'calypso/my-sites/customer-home/cards/constants';
import MaterialIcon from 'calypso/components/material-icon';

/**
 * Style dependencies
 */
import quickStartVideoImage from 'calypso/assets/images/customer-home/quick-start-video-ss.png';

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
				<div className="quick-start-video__content educational-content">
					<div className="quick-start-video__content-wrapper educational-content__wrapper">
						<h3>{ translate( 'Video: Getting started on WordPress.com' ) }</h3>
						<p className="quick-start-video__content-description educational-content__description customer-home__card-subheader">
							{ translate(
								'This video tour of WordPress.com will show you everything you need to know to start building your website.'
							) }
						</p>
						<div className="quick-start-video__content-links educational-content__links">
							<div className="quick-start-video__content-link educational-content__link">
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
										url: localizeUrl(
											'https://wordpress.com/support/getting-started-with-wordpress-com/#video-getting-started-with-word-press-com'
										),
										card_name: FEATURE_QUICK_START_VIDEO,
									} }
									statsName={ FEATURE_QUICK_START_VIDEO }
								>
									{ translate( 'Watch the video' ) }
								</InlineSupportLink>
							</div>
						</div>
					</div>
					{ isDesktop() && (
						<div className="quick-start-video__content-illustration educational-content__illustration">
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
									url: localizeUrl(
										'https://wordpress.com/support/getting-started-with-wordpress-com/#video-getting-started-with-word-press-com'
									),
									card_name: FEATURE_QUICK_START_VIDEO,
								} }
								statsName={ FEATURE_QUICK_START_VIDEO }
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
