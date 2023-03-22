import { useTranslate } from 'i18n-calypso';
import TrendingTags from './trending-tags';
import './style.scss';

export default function TagsPage() {
	const translate = useTranslate();

	return (
		<div className="tags-page">
			{ /* TODO: move this into the header perhaps? */ }
			<div>
				<h1>{ translate( 'Topics' ) }</h1>
				<p>{ translate( 'Discover unique topics, follow your interests, or start writing.' ) }</p>
			</div>
			<div>
				<TrendingTags />
			</div>
		</div>
	);
}
