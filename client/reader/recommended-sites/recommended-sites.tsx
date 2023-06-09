import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DotPager from 'calypso/components/dot-pager';
import { Railcar } from 'calypso/data/marketplace/types';
import { requestRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';
import {
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
} from 'calypso/state/reader/recommended-sites/selectors';
import './style.scss';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { getDismissedSites } from 'calypso/state/reader/site-dismissals/selectors';
import { RecommendedSitePlaceholder } from './placeholder';
import RecommendedSite from './recommended-site';

const displayRecommendedSitesTotal = 2;

const seed = Math.floor( Math.random() * 10001 );

type RecommendedSite = {
	ID: number;
	blogId: number;
	feedId: number;
	railcar?: Railcar;
};

const RecommendedSitesResponsiveContainer: React.FC = ( { children } ) => {
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

const RecommendedSitesSkeleton = ( { count }: { count: number } ) => {
	const items = [];

	for ( let i = 0; i < count; i++ ) {
		items.push( <RecommendedSitePlaceholder key={ i } /> );
	}

	return <>{ items }</>;
};

const RecommendedSites = () => {
	const translate = useTranslate();

	const dispatch = useDispatch();
	const recommendedSites = useSelector(
		( state ) => getReaderRecommendedSites( state, seed ) as RecommendedSite[]
	);
	const offset = useSelector( ( state ) => getReaderRecommendedSitesPagingOffset( state, seed ) );
	const blockedSites = useSelector( ( state ) => getBlockedSites( state ) );
	const dismissedSites = useSelector( ( state ) => getDismissedSites( state ) );

	const filteredRecommendedSites = useMemo( () => {
		if ( ! Array.isArray( recommendedSites ) || ! recommendedSites.length ) {
			return [];
		}
		return recommendedSites
			.filter( ( { blogId } ) => {
				return ! blockedSites.includes( blogId ) && ! dismissedSites.includes( blogId );
			} )
			.slice( 0, displayRecommendedSitesTotal );
	}, [ recommendedSites, blockedSites, dismissedSites ] );

	useEffect( () => {
		if ( filteredRecommendedSites.length <= 4 ) {
			dispatch( requestRecommendedSites( { seed, offset } ) );
		}
	}, [ dispatch, filteredRecommendedSites.length, offset ] );

	if ( ! filteredRecommendedSites?.length ) {
		return null;
	}

	return (
		<div className="recommended-sites">
			<h2 className="recommended-sites__heading">{ translate( 'Recommended sites' ) }</h2>
			<RecommendedSitesResponsiveContainer>
				{ filteredRecommendedSites.map( ( { blogId, feedId, railcar } ) => {
					return (
						<RecommendedSite
							key={ `${ blogId }-${ feedId }` }
							siteId={ blogId }
							feedId={ feedId }
							railcar={ railcar }
						/>
					);
				} ) }
				{ filteredRecommendedSites.length < displayRecommendedSitesTotal && (
					<RecommendedSitesSkeleton
						count={ displayRecommendedSitesTotal - filteredRecommendedSites.length }
					/>
				) }
			</RecommendedSitesResponsiveContainer>
		</div>
	);
};

export default RecommendedSites;
