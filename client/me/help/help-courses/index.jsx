import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { receiveHelpCourses } from 'calypso/state/help/courses/actions';
import { getHelpCourses } from 'calypso/state/help/courses/selectors';
import {
	getUserPurchases,
	isFetchingUserPurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { helpCourses } from './constants';
import CourseList, { CourseListPlaceholder } from './course-list';

import './style.scss';

class Courses extends Component {
	UNSAFE_componentWillMount() {
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
		const { courses, isEligible, isLoading, translate } = this.props;

		return (
			<Main className="help-courses">
				<PageViewTracker path="/help/courses" title="Help > Courses" />
				<HeaderCake backHref="/help" isCompact={ false } className="help-courses__header-cake">
					{ translate( 'Courses' ) }
				</HeaderCake>
				{ isLoading ? (
					<CourseListPlaceholder />
				) : (
					<CourseList courses={ courses } isBusinessPlanUser={ isEligible } />
				) }

				<QueryUserPurchases />
			</Main>
		);
	}
}

export function mapStateToProps( state ) {
	const purchases = getUserPurchases( state );
	const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );
	const isEligible =
		purchaseSlugs &&
		( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) );
	const courses = getHelpCourses( state );
	const isLoading =
		isFetchingUserPurchases( state ) || ! courses || ! hasLoadedUserPurchasesFromServer( state );

	return {
		isLoading,
		isEligible,
		courses,
	};
}

// This function only adds a way of dispatching courses because we don't have another mechanism yet.
// Once the courses make it into the API this function should go away in preference for
// something like <QueryHelpCourses />
const fetchCourses = () => receiveHelpCourses( helpCourses );

export default connect( mapStateToProps, { fetchCourses } )( localize( Courses ) );
