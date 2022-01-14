import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import {
	getUserPurchases,
	isFetchingUserPurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { helpCourses } from './constants';
import CourseList, { CourseListPlaceholder } from './course-list';

import './style.scss';

function Courses() {
	const translate = useTranslate();
	const purchases = useSelector( getUserPurchases );
	const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );
	const isEligible =
		purchaseSlugs &&
		( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) );
	const fetchingUserPurchases = useSelector( isFetchingUserPurchases );
	const loadedUserPurchases = useSelector( hasLoadedUserPurchasesFromServer );
	const isLoading = fetchingUserPurchases || ! loadedUserPurchases;

	return (
		<Main className="help-courses">
			<PageViewTracker path="/help/courses" title="Help > Courses" />
			<QueryUserPurchases />
			<HeaderCake backHref="/help" isCompact={ false } className="help-courses__header-cake">
				{ translate( 'Courses' ) }
			</HeaderCake>
			{ isLoading ? (
				<CourseListPlaceholder />
			) : (
				<CourseList courses={ helpCourses } isBusinessPlanUser={ isEligible } />
			) }
		</Main>
	);
}

export default Courses;
