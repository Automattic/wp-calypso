import { BreakpointValues } from '@automattic/viewport';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DotPager from 'calypso/components/dot-pager';
import { requestRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';
import {
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
} from 'calypso/state/reader/recommended-sites/selectors';
import RecommendedSite from './recommended-site';
import './style.scss';

const seed = Math.floor( Math.random() * 10001 );

type RecommendedSite = {
	blogId: number;
	feedId: number;
};

const shouldShowDotPagerView = ( containerWidth: number ) =>
	containerWidth < BreakpointValues.Px660;

const RecommendedSitesResponsiveContainer: React.FC = ( { children } ) => {
	const divRef = useRef< HTMLDivElement >( null );
	const [ showDotPagerView, setShowDotPagerView ] = useState< boolean >();

	useEffect( () => {
		// Ensure the ref is current and ResizeObserver API is supported
		if ( divRef.current && typeof ResizeObserver !== 'undefined' ) {
			// Implement ResizeObserver to track the width changes of the container.
			// This approach offers an improved user experience as it accounts for the Calypso sidebar
			// that collapses at certain points, expanding the container width despite a decrease in window width.
			// Depending solely on viewport breakpoints doesn't yield satisfactory visual results, as it doesn't
			// consider these dynamic UI changes.
			setShowDotPagerView( shouldShowDotPagerView( divRef.current.offsetWidth ) );
			const observer = new ResizeObserver( ( [ entry ] ) => {
				if ( ! entry ) {
					return;
				}

				setShowDotPagerView( shouldShowDotPagerView( entry.contentRect.width ) );
			} );
			observer.observe( divRef.current );

			return () => {
				if ( observer ) {
					observer.disconnect();
				}
			};
		}
	}, [] ); // Empty dependency array ensures this runs on mount and unmount only

	const wrappedChildren = useMemo( () => {
		if ( showDotPagerView === undefined ) {
			// Do not display anything until the current container width is determined,
			// i.e. until the ResizeObserver callback is triggered
			return null;
		}

		if ( showDotPagerView ) {
			return <DotPager isClickEnabled={ true }>{ children }</DotPager>;
		}

		return (
			<HStack className="recommended-sites__horizontal-list" spacing={ 6 } as="ul">
				{ children }
			</HStack>
		);
	}, [ children, showDotPagerView ] );

	return (
		<div ref={ divRef } style={ { width: '100%', height: '100%' } }>
			{ wrappedChildren }
		</div>
	);
};

const RecommendedSites = () => {
	const translate = useTranslate();

	const dispatch = useDispatch();
	const recommendedSites = useSelector(
		( state ) => getReaderRecommendedSites( state, seed ) as RecommendedSite[]
	);
	const offset = useSelector( ( state ) => getReaderRecommendedSitesPagingOffset( state, seed ) );

	useEffect( () => {
		dispatch( requestRecommendedSites( { seed, offset } ) );
	}, [ dispatch, offset ] );

	const slicedRecommendedSites = useMemo( () => {
		return Array.isArray( recommendedSites ) ? recommendedSites.slice( 0, 2 ) : [];
	}, [ recommendedSites ] );

	if ( ! slicedRecommendedSites?.length ) {
		return null;
	}

	return (
		<div className="recommended-sites">
			<h2 className="recommended-sites__heading">{ translate( 'Recommended sites' ) }</h2>
			<RecommendedSitesResponsiveContainer>
				{ slicedRecommendedSites.map( ( { blogId, feedId } ) => {
					return (
						<RecommendedSite
							key={ `${ blogId }-${ feedId }` }
							siteId={ blogId }
							feedId={ feedId }
						/>
					);
				} ) }
			</RecommendedSitesResponsiveContainer>
		</div>
	);
};

export default RecommendedSites;
