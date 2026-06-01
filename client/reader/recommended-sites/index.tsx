import { DotPager } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
	selectVisibleRecommendedSites,
	useRecommendedSites,
} from 'calypso/reader/data/recommended-sites';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { seed } from './constants';
import { RecommendedSitesPlaceholder } from './placeholder';
import RecommendedSite from './site';
import './style.scss';

const displayRecommendedSitesTotal = 2;

export { seed };

const RecommendedSitesResponsiveContainer: React.FC< { children: React.ReactNode } > = ( {
	children,
} ) => {
	const displayAsDotPager = useBreakpoint( '<1040px' );
	if ( displayAsDotPager ) {
		return <DotPager isClickEnabled>{ children }</DotPager>;
	}
	return (
		<HStack className="recommended-sites__horizontal-list" spacing={ 6 } as="ul">
			{ children }
		</HStack>
	);
};

const RecommendedSites = () => {
	const translate = useTranslate();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const amountOfPlaceHolders = useBreakpoint( '<1040px' ) ? 1 : 2;
	const blockedSites = useSelector( getBlockedSites );
	const {
		data: recommendedSites = [],
		fetchNextPage,
		hasNextPage,
		isFetchNextPageError,
		isFetchingNextPage,
	} = useRecommendedSites( {
		seed,
		number: 4,
		enabled: isEmailVerified,
	} );

	const filteredRecommendedSites = useMemo( () => {
		return selectVisibleRecommendedSites(
			recommendedSites,
			blockedSites,
			displayRecommendedSitesTotal
		);
	}, [ recommendedSites, blockedSites ] );

	useEffect( () => {
		if (
			isEmailVerified &&
			filteredRecommendedSites.length < displayRecommendedSitesTotal &&
			hasNextPage &&
			! isFetchNextPageError &&
			! isFetchingNextPage
		) {
			fetchNextPage();
		}
	}, [
		isEmailVerified,
		filteredRecommendedSites.length,
		hasNextPage,
		isFetchNextPageError,
		isFetchingNextPage,
		fetchNextPage,
	] );

	if ( ! isEmailVerified ) {
		return null;
	}
	return (
		<div className="recommended-sites">
			<h2 className="recommended-sites__heading">{ translate( 'Recommended sites' ) }</h2>
			<RecommendedSitesResponsiveContainer>
				{ filteredRecommendedSites.map( ( { blogId, feedId, railcar }, index ) => {
					return (
						<RecommendedSite
							key={ `${ blogId }-${ feedId }` }
							siteId={ blogId }
							feedId={ feedId }
							railcar={ railcar }
							uiPosition={ index }
						/>
					);
				} ) }
				{ filteredRecommendedSites.length < displayRecommendedSitesTotal && (
					<RecommendedSitesPlaceholder
						count={ amountOfPlaceHolders - filteredRecommendedSites.length }
					/>
				) }
			</RecommendedSitesResponsiveContainer>
		</div>
	);
};

export { RecommendedSites };
export default RecommendedSites;
