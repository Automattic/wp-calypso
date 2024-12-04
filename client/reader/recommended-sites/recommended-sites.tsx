import { Railcar } from '@automattic/calypso-analytics';
import { DotPager } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import {
	RecommendedSitesRequestAction,
	requestRecommendedSites,
} from 'calypso/state/reader/recommended-sites/actions';
import {
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
} from 'calypso/state/reader/recommended-sites/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { RecommendedSitePlaceholder } from './placeholder';
import RecommendedSite from './recommended-site';
import './style.scss';

const displayRecommendedSitesTotal = 2;

export const seed = Math.floor( Math.random() * 10001 );

type RecommendedSiteType = {
	blogId: number;
	feedId?: number;
	railcar: Railcar;
	title: string;
	url: string;
};

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

const RecommendedSitesPlaceholder = ( { count }: { count: number } ) => {
	const items = [];

	for ( let i = 0; i < count; i++ ) {
		items.push( <RecommendedSitePlaceholder key={ i } /> );
	}

	return <>{ items }</>;
};

const RecommendedSites = () => {
	const translate = useTranslate();
	const dispatch = useDispatch< Dispatch< RecommendedSitesRequestAction > >();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const amountOfPlaceHolders = useBreakpoint( '<1040px' ) ? 1 : 2;

	const recommendedSites = useSelector(
		( state ) => getReaderRecommendedSites( state, seed ) as RecommendedSiteType[]
	);

	const offset = useSelector( ( state ) => getReaderRecommendedSitesPagingOffset( state, seed ) );
	const blockedSites = useSelector( getBlockedSites );

	const filteredRecommendedSites = useMemo( () => {
		if ( ! Array.isArray( recommendedSites ) || ! recommendedSites.length ) {
			return [];
		}
		return recommendedSites
			.filter( ( { blogId } ) => {
				return ! blockedSites.includes( blogId );
			} )
			.slice( 0, displayRecommendedSitesTotal );
	}, [ recommendedSites, blockedSites ] );

	useEffect( () => {
		if ( filteredRecommendedSites.length <= 4 ) {
			dispatch( requestRecommendedSites( { seed, offset } ) );
		}
	}, [ dispatch, filteredRecommendedSites.length, offset ] );

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

export default RecommendedSites;
