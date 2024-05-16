import { useTranslate } from 'i18n-calypso';
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
	return (
		<div className="tags__main">
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
		</div>
	);
}
