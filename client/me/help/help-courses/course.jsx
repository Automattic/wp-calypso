import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import HelpTeaserButton from '../help-teaser-button';
import CourseScheduleItem from './course-schedule-item';
import CourseVideo from './course-video';

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
							// translators: %(planName)s is the name of the Creator/Business plan.
							title={ translate( 'Join this course with the %(planName)s plan.', {
								args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() },
							} ) }
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
