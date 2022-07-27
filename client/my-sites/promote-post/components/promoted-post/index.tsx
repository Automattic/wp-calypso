import { CompactCard } from '@automattic/components';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import './style.scss';

export default function PromotedPost() {
	return (
		<CompactCard className="promoted-post__card">
			<div className="promoted-post__main">
				<div className="promoted-post__subtitle">Draft</div>
				<div className="promoted-post__title">Title</div>
				<div className="promoted-post__subtitle">
					July 2022 - July 2022 562 Reached, 10 Clicks, Spent $11 in 5 days
				</div>
			</div>
			<EllipsisMenu
				className="promoted-post__actions-toggle"
				position="bottom left"
				// onToggle=
			>
				<div>Cancel</div>
				<div>...</div>
			</EllipsisMenu>
		</CompactCard>
	);
}
