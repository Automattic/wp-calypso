/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { FEATURE_WPCOURSES } from 'calypso/my-sites/customer-home/cards/constants';
import MaterialIcon from 'calypso/components/material-icon';

export const WpCourses = ( { trackWpCoursesImpression, trackWpCoursesClick } ) => {
	useEffect( () => {
		trackWpCoursesImpression();
	}, [ trackWpCoursesImpression ] );

	return (
		<div className="wpcourses">
			<Card>
				<div className="wpcourses__content educational-content">
					<div className="wpcourses__content-wrapper educational-content__wrapper">
						<h3>The Official WordPress.com Guide to Blogging</h3>
						<p className="wpcourses__content-description educational-content__description customer-home__card-subheader">
							We assembled a team of world-class WordPress experts to teach you everything you need
							to know to build a popular blog in 2021.
						</p>
						<div className="wpcourses__content-links educational-content__links">
							<div className="wpcourses__content-link educational-content__link">
								<MaterialIcon icon="play_circle_outline" />
								<a
									href="https://wpcourses.com/course/blogging-beginners-course/"
									onclick={ trackWpCoursesClick }
									target="_blank"
									rel="noreferrer"
								>
									Watch the video
								</a>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

const trackCardImpression = () => {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_card_impression', {
			card: FEATURE_WPCOURSES,
		} ),
		bumpStat( 'calypso_customer_home_card_impression', FEATURE_WPCOURSES )
	);
};

const trackCardClick = () => {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_education', {
			card_name: FEATURE_WPCOURSES,
		} )
	);
};

const mapDispatchToProps = {
	trackWpCoursesImpression: trackCardImpression,
	trackWpCoursesClick: trackCardClick,
};

export default connect( null, mapDispatchToProps )( WpCourses );
