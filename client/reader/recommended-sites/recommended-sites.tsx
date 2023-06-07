import { useMobileBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
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

const RecommendedSitesResponsiveContainer: React.FC = ( { children } ) => {
	const isMobile = useMobileBreakpoint();
	if ( isMobile ) {
		return <DotPager isClickEnabled={ true }>{ children }</DotPager>;
	}
	return (
		<HStack className="recommended-sites__list" spacing={ 6 } as="ul">
			{ children }
		</HStack>
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
