/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CourseScheduleItem from './course-schedule-item';
import HelpTeaserButton from '../help-teaser-button';
import CourseVideo from './course-video';
import { recordTracksEvent } from 'lib/analytics/tracks';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { getSiteSlug } from 'state/sites/selectors';

class Course extends Component {
	componentDidMount() {
		const { isBusinessPlanUser } = this.props;

		recordTracksEvent( 'calypso_help_course_pageview', {
			is_business_plan_user: isBusinessPlanUser,
		} );
	}

	render() {
		const { title, description, schedule, isBusinessPlanUser, video, translate } = this.props;

		return (
			<div className="help-courses__course">
				{ isBusinessPlanUser && video && <CourseVideo { ...video } /> }
				<Card compact>
					<h1 className="help-courses__course-title">{ title }</h1>
					<p className="help-courses__course-description">{ description }</p>
					{ ! isBusinessPlanUser && (
						<HelpTeaserButton
							href={ `/plans/${ this.props.primarySiteSlug }` }
							title={ translate( 'Join this course with the Business Plan.' ) }
							description={ translate(
								'Upgrade to access webinars and courses to learn how to make the most of your site'
							) }
						/>
					) }
				</Card>
				{ schedule &&
					schedule.map( ( item, key ) => {
						return (
							<CourseScheduleItem
								{ ...item }
								key={ key }
								isBusinessPlanUser={ isBusinessPlanUser }
							/>
						);
					} ) }
			</div>
		);
	}
}
export default connect( ( state ) => {
	return {
		primarySiteSlug: getSiteSlug( state, getPrimarySiteId( state ) ),
	};
} )( localize( Course ) );

export const CoursePlaceholder = () => {
	return <div className="help-courses__course is-placeholder" />;
};
