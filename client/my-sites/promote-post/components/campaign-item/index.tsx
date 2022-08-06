import { CompactCard } from '@automattic/components';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import './style.scss';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { SmartStatuses } from 'calypso/my-sites/promote-post/components/campaigns-list';

type Props = {
	campaign: Campaign;
};

export default function CampaignItem( { campaign }: Props ) {
	return (
		<CompactCard className="campaign-item__card">
			<div className="campaign-item__main">
				<div>
					<div className="campaign-item__subtitle">{ SmartStatuses[ campaign.status_smart ] }</div>
					<div className="campaign-item__title">{ campaign.content_config.title }</div>
					<div className="campaign-item__subtitle">
						{ campaign.start_date } - { campaign.end_date }
						todo stats 562 Reached, 10 Clicks, Spent $11 in 5 days
					</div>
				</div>
				<div className="campaign-item__image-container">
					<img className="campaign-item__image" src={ campaign.content_image } alt="" />
				</div>
			</div>
			<EllipsisMenu
				className="campaign-item__actions-toggle"
				position="bottom left"
				// onToggle=
			>
				<PopoverMenuItem icon="cross">Cancel</PopoverMenuItem>
				<PopoverMenuItem icon="add">TODO</PopoverMenuItem>
			</EllipsisMenu>
		</CompactCard>
	);
}
