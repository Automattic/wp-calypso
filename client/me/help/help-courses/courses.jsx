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
import Course, { CoursePlaceholder } from './course';
import QueryUserPurchases from 'components/data/query-user-purchases';

class Courses extends Component {
	render() {
		const {
			translate,
			userId,
			isBusinessPlanUser,
			isLoading
		} = this.props;

		return (
			<Main className="help-courses">
				<HeaderCake backHref="/help" isCompact={ false }>{ translate( 'Courses' ) }</HeaderCake>
				{ isLoading
					? <CourseListPlaceholder />
					: <CourseList /> }

				{ isLoading
					? <CoursePlaceholder />
					: isBusinessPlanUser && <Course /> }

				<QueryUserPurchases userId={ userId } />
			</Main>
		);
	}
}

export default Courses;
