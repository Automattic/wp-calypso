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

class Courses extends Component {
	render() {
		const {
			translate,
			userId,
			showRecentCourseRecordings,
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
					: <CourseList courses={ courses } showRecentCourseRecordings={ showRecentCourseRecordings } /> }

				<QueryUserPurchases userId={ userId } />
			</Main>
		);
	}
}

export default Courses;
