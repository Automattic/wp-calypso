import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';
import {
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
} from 'calypso/state/reader/recommended-sites/selectors';
import RecommendedSite from './recommended-site';
import './style.scss';

const seed = Math.floor( Math.random() * 10001 );

const RecommendedSites = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const recommendedSites = useSelector( ( state ) => getReaderRecommendedSites( state, seed ) );
	const offset = useSelector( ( state ) => getReaderRecommendedSitesPagingOffset( state, seed ) );
	useEffect( () => {
		dispatch( requestRecommendedSites( { seed, offset } ) );
	}, [ dispatch, offset ] );

	// todo: Render loading state

	if ( ! recommendedSites?.length ) {
		return null;
	}

	return (
		<div className="recommended-sites">
			<h2 className="recommended-sites__heading">{ translate( 'Recommended sites' ) }</h2>
			<HStack className="recommended-sites__list" spacing={ 6 } as="ul">
				{ recommendedSites.slice( 0, 2 ).map( ( { blogId, feedId } ) => {
					return (
						<RecommendedSite
							key={ `${ blogId }-${ feedId }` }
							siteId={ blogId }
							feedId={ feedId }
						/>
					);
				} ) }
			</HStack>
		</div>
	);
};

export default RecommendedSites;
