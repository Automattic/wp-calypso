import TrendingTags from './trending-tags';
import './style.scss';

export default function TagsPage() {
	return (
		<div className="tags-page">
			<h4>Trending</h4>
			<div>
				<TrendingTags />
			</div>
		</div>
	);
}
