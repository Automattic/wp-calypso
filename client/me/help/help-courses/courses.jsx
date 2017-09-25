/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CourseList, { CourseListPlaceholder } from './course-list';
import QueryUserPurchases from 'components/data/query-user-purchases';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';

class Courses extends Component {
	componentWillMount() {
		this.fetchCoursesIfNeeded();
	}

	fetchCoursesIfNeeded() {
		//TODO: When courses make it into the API we will no longer need this code.
		//      We can move towards the use of something like <QueryHelpCourses />
		const { courses, fetchCourses } = this.props;

		if ( courses ) {
			return;
		}

		fetchCourses();
	}

	render() {
		const {
			translate,
			userId,
			isBusinessPlanUser,
			courses,
			isLoading
		} = this.props;

		return (
			<Main className="help-courses">
				<HeaderCake backHref="/help" isCompact={ false } className="help-courses__header-cake">
					{ translate( 'Courses' ) }
				</HeaderCake>
				{ isLoading
					? <CourseListPlaceholder />
					: <CourseList courses={ courses } isBusinessPlanUser={ isBusinessPlanUser } /> }

				<QueryUserPurchases userId={ userId } />
			</Main>
		);
	}
}

export default Courses;
