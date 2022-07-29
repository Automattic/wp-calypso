import { CompactCard } from '@automattic/components';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import './style.scss';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { SmartStatuses } from 'calypso/my-sites/promote-post/components/promoted-post-list';

type Props = {
	campaign: Campaign;
};

export default function PromotedPost( { campaign }: Props ) {
	return (
		<CompactCard className="promoted-post__card">
			<div className="promoted-post__main">
				<div>
					<div className="promoted-post__subtitle">{ SmartStatuses[ campaign.status_smart ] }</div>
					<div className="promoted-post__title">{ campaign.content_config.title }</div>
					<div className="promoted-post__subtitle">
						{ campaign.start_date } - { campaign.end_date }
						todo stats 562 Reached, 10 Clicks, Spent $11 in 5 days
					</div>
				</div>
				<div className="promoted-post__image-container">
					<img className="promoted-post__image" src={ campaign.content_image } alt="" />
				</div>
			</div>
			<EllipsisMenu
				className="promoted-post__actions-toggle"
				position="bottom left"
				// onToggle=
			>
				<PopoverMenuItem icon="cross">Cancel</PopoverMenuItem>
				<PopoverMenuItem icon="add">TODO</PopoverMenuItem>
			</EllipsisMenu>
		</CompactCard>
	);
}
