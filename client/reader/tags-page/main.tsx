import { TagResult } from './controller';
import TrendingTags from './trending-tags';
import './style.scss';

interface Props {
	trendingTags: TagResult[];
}

export default function TagsPage( { trendingTags }: Props ) {
	return (
		<div className="tags-page">
			<h4>Trending</h4>
			<div>
				<TrendingTags trendingTags={ trendingTags } />
			</div>
		</div>
	);
}
