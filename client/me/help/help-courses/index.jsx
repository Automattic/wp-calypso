/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CourseList, { CourseListPlaceholder } from './course-list';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getHelpCourses } from 'state/help/courses/selectors';
import { helpCourses } from './constants';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { receiveHelpCourses } from 'state/help/courses/actions';
import {
	getUserPurchases,
	isFetchingUserPurchases,
	hasLoadedUserPurchasesFromServer,
} from 'state/purchases/selectors';

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
		const { courses, isBusinessPlanUser, isLoading, translate, userId } = this.props;

		return (
			<Main className="help-courses">
				<HeaderCake backHref="/help" isCompact={ false } className="help-courses__header-cake">
					{ translate( 'Courses' ) }
				</HeaderCake>
				{ isLoading ? (
					<CourseListPlaceholder />
				) : (
					<CourseList courses={ courses } isBusinessPlanUser={ isBusinessPlanUser } />
				) }

				<QueryUserPurchases userId={ userId } />
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const userId = getCurrentUserId( state );
	const purchases = getUserPurchases( state, userId );
	const isBusinessPlanUser =
		purchases && !! find( purchases, purchase => purchase.productSlug === PLAN_BUSINESS );
	const courses = getHelpCourses( state );
	const isLoading =
		isFetchingUserPurchases( state ) || ! courses || ! hasLoadedUserPurchasesFromServer( state );

	return {
		isLoading,
		isBusinessPlanUser,
		userId,
		courses,
	};
}

// This function only adds a way of dispatching courses because we don't have another mechanism yet.
// Once the courses make it into the API this function should go away in preference for
// something like <QueryHelpCourses />
const fetchCourses = () => receiveHelpCourses( helpCourses );

export default connect( mapStateToProps, { fetchCourses } )( localize( Courses ) );
