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
	isFetchingUserPurchases
} from 'state/purchases/selectors';
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
					date: i18n.moment( new Date( 'Thu, 25 Aug 2016 20:00:00 +0000' ) ),
					registrationUrl: 'https://zoom.us/webinar/register/09d8d987acc52235c5b9141539e44ee6'
				},
				{
					date: i18n.moment( new Date( 'Sat, 27 Aug 2016 16:00:00 +0000' ) ),
					registrationUrl: 'http://wordpress.com'
				},
				{
					date: i18n.moment( new Date( 'Wed, 31 Aug 2016 17:30:00 +0000' ) ),
					registrationUrl: 'http://wordpress.com'
				},
			],
			videos: [
				{
					date: i18n.moment( new Date( 'Thu, 25 Aug 2016 01:00:00 +0000' ) ),
					title: i18n.translate( 'How to Make a Business Site on WordPress.com' ),
					description: i18n.translate(
						'A 60-minute overview course with two of our Happiness Engineers. In this live group session, ' +
						'we will provide an overview of WordPress.com, discuss features of the WordPress.com Business ' +
						'plan, provide a basic setup overview to help you get started with your site, and show you ' +
						'where to find additional resources and help in the future.'
					),
					youtubeId: 'f44-4TgnWTs'
				}
			]
		}
	];
}

function mapStateToProps( state ) {
	const userId = getCurrentUserId( state );
	const purchases = getUserPurchases( state, userId );
	const isBusinessPlanUser = purchases && !! find( purchases, purchase => purchase.productSlug === PLAN_BUSINESS );
	const isLoading = isFetchingUserPurchases( state );
	const courses = getCourses();

	//TODO: Add tracks pings

	return {
		isLoading,
		isBusinessPlanUser,
		userId,
		courses
	};
}

export default connect( mapStateToProps )( localize( Courses ) );
