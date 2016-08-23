/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import CourseList, { CourseListPlaceholder } from './course-list';
import QueryUserPurchases from 'components/data/query-user-purchases';
import QueryHelpCourses from 'components/data/query-help-courses';

class Courses extends Component {
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
				<QueryHelpCourses />
			</Main>
		);
	}
}

export default Courses;
