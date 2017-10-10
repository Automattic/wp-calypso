/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import CourseList, { CourseListPlaceholder } from './course-list';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getHelpCourses } from 'state/help/courses/selectors';
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

function getCourses() {
	return [
		{
			title: i18n.translate(
				'Everything You Need to Know About SEO and Marketing for Your Website'
			),
			description: i18n.translate(
				'You will leave this 60-minute session with a plan for optimizing your site for search engines ' +
					'and an overview of basic tactics for increasing your traffic. Our Happiness Engineers will provide a ' +
					"foundation for making sure that your site meets current SEO standards. We'll also discuss how to " +
					'maximize tools like Google Analytics and Webmaster Tools.'
			),
			video: {
				youtubeId: 'FU7uxbngrq4',
			},
		},
		{
			title: i18n.translate( 'How to Make a Business Site on WordPress.com' ),
			description: i18n.translate(
				'A 60-minute overview course with two of our Happiness Engineers. In this live group session, ' +
					'we provide an overview of WordPress.com, discuss features of the WordPress.com Business ' +
					'plan, provide a basic setup overview to help you get started with your site, and show you ' +
					'where to find additional resources and help in the future.'
			),
			video: {
				youtubeId: 'S2h_mV0OAcU',
			},
		},
	];
}

function mapDispatchToProps( dispatch ) {
	// This function only adds a way of dispatching courses because we don't have another mechanism yet.
	// Once the courses make it into the API this function should go away in preference for
	// something linke <QueryHelpCourses />
	return {
		fetchCourses: () => dispatch( receiveHelpCourses( getCourses() ) ),
	};
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( Courses ) );
