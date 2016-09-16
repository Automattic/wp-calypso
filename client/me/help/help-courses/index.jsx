/**
 * External dependencies
 */
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Courses from './courses';
import {
	getUserPurchases,
	isFetchingUserPurchases,
	hasLoadedUserPurchasesFromServer
} from 'state/purchases/selectors';
import { receiveHelpCourses } from 'state/help/courses/actions';
import { getHelpCourses } from 'state/help/courses/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';

function getCourses() {
	return [
		{
			title: i18n.translate( 'How to Make a Business Site on WordPress.com' ),
			description: i18n.translate(
				'A 60-minute overview course with two of our Happiness Engineers. In this live group session, ' +
				'we will provide an overview of WordPress.com, discuss features of the WordPress.com Business ' +
				'plan, provide a basic setup overview to help you get started with your site, and show you ' +
				'where to find additional resources and help in the future.'
			),
			schedule: [
				{
					date: i18n.moment( new Date( 'Fri, 23 Sep 2016 18:00:00 +0000' ) ),
					registrationUrl: 'https://zoom.us/webinar/register/732df6652d490ab0dc2040ba88984b7b'
				},
				{
					date: i18n.moment( new Date( 'Tue, 27 Sep 2016 17:00:00 +0000' ) ),
					registrationUrl: 'https://zoom.us/webinar/register/c14f7c38c388111466858a512be5123a'
				},
				{
					date: i18n.moment( new Date( 'Thur, 29 Sep 2016 20:00:00 +0000' ) ),
					registrationUrl: 'https://zoom.us/webinar/register/e70a34c1ca8c13dac5b9141539e44ee6'
				},
			],
			videos: [
				{
					date: i18n.moment( new Date( 'Fri, 2 Sep 2016 01:00:00 +0000' ) ),
					title: i18n.translate( 'How to Make a Business Site on WordPress.com' ),
					description: i18n.translate(
						'A 60-minute overview course with two of our Happiness Engineers. In this live group session, ' +
						'we will provide an overview of WordPress.com, discuss features of the WordPress.com Business ' +
						'plan, provide a basic setup overview to help you get started with your site, and show you ' +
						'where to find additional resources and help in the future.'
					),
					youtubeId: 'S2h_mV0OAcU'
				}
			]
		}
	];
}

function mapDispatchToProps( dispatch ) {
	// This function only adds a way of dispatching courses because we don't have another mechanism yet.
	// Once the courses make it into the API this function should go away in preference for
	// something linke <QueryHelpCourses />
	return {
		fetchCourses: () => dispatch( receiveHelpCourses( getCourses() ) )
	};
}

function mapStateToProps( state ) {
	const userId = getCurrentUserId( state );
	const purchases = getUserPurchases( state, userId );
	const isBusinessPlanUser = purchases && !! find( purchases, purchase => purchase.productSlug === PLAN_BUSINESS );
	const courses = getHelpCourses( state );
	const isLoading = isFetchingUserPurchases( state ) || ! courses || ! hasLoadedUserPurchasesFromServer( state );

	return {
		isLoading,
		isBusinessPlanUser,
		userId,
		courses
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Courses ) );
