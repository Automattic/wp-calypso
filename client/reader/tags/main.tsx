import { useTranslate } from 'i18n-calypso';
import { TagResult } from './controller';
import TrendingTags from './trending-tags';
import './style.scss';

interface Props {
	trendingTags: TagResult[];
}

export default function TagsPage( { trendingTags }: Props ) {
	const translate = useTranslate();
	return (
		<div className="tags">
			<h4> { 
				// translators: The heading of the reader trending tags section
				translate('Trending')
			} </h4>
			<div>
				<TrendingTags trendingTags={ trendingTags } />
			</div>
		</div>
	);
}
