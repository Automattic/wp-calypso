import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import BackButton from 'calypso/components/back-button';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import AlphabeticTags from './alphabetic-tags';
import { TagResult, AlphabeticTagsResult } from './controller';
import TrendingTags from './trending-tags';
import './style.scss';

interface Props {
	trendingTags: TagResult[];
	alphabeticTags: AlphabeticTagsResult;
}

export default function TagsPage( { trendingTags, alphabeticTags }: Props ) {
	const translate = useTranslate();
	const previousRoute = useSelector( getPreviousRoute );
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<ReaderMain className="tags__main">
			{ isLoggedIn && previousRoute && <BackButton onClick={ () => page.back( previousRoute ) } /> }
			{ isLoggedIn && (
				<NavigationHeader
					title={ translate( 'All the Tags' ) }
					subtitle={ translate(
						`For every one of your interests, there's a tag on WordPress.com.`
					) }
				/>
			) }
			<div className="tags__header">
				<h4>
					{
						// translators: The heading of the reader trending tags section
						translate( 'Trending' )
					}
				</h4>
			</div>
			<div>
				<TrendingTags trendingTags={ trendingTags } />
				<AlphabeticTags alphabeticTags={ alphabeticTags } />
			</div>
		</ReaderMain>
	);
}
