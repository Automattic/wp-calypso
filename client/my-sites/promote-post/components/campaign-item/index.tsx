import './style.scss';
import { Button } from '@wordpress/components';
import Badge from 'calypso/components/badge';
import FoldableCard from 'calypso/components/foldable-card';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';

type Props = {
	campaign: Campaign;
};

export default function CampaignItem( { campaign }: Props ) {
	const header = (
		<div className="campaign-item__header">
			<div className="campaign-item__header-image">
				<img src={ campaign.content_image } alt="" />
			</div>
			<div className="campaign-item__header-content">
				<div className="campaign-item__header-title">{ campaign.content_config.title }</div>
				<div className="campaign-item__header-status">
					<Badge>todo { campaign.status_smart }</Badge>
				</div>
			</div>
		</div>
	);
	return (
		<FoldableCard header={ header }>
			<div className="campaign-item__stats">
				<div className="campaign-item__stats-row1">
					<div className="campaign-item__reach">
						<div className="campaign-item__reach-value">123 todo</div>
						<div className="campaign-item__reach-label">Reached</div>
					</div>
					<div className="campaign-item__clicks">
						<div className="campaign-item__clicks-value">56 todo</div>
						<div className="campaign-item__clicks-label">Clicks</div>
					</div>
					<div className="campaign-item__placeholder"></div>
				</div>
				<div className="campaign-item__stats-row2">
					<div className="campaign-item__budget">
						<div className="campaign-item__budget-value">123 todo</div>
						<div className="campaign-item__budget-label">Overall spending</div>
					</div>
					<div className="campaign-item__clicks">
						<div className="campaign-item__clicks-value">4.44% todo</div>
						<div className="campaign-item__clicks-label">Click-through rate</div>
					</div>
					<div className="campaign-item__clicks">
						<div className="campaign-item__clicks-value">$56 todo ($23 left)</div>
						<div className="campaign-item__clicks-label">Budget</div>
					</div>
				</div>
			</div>
			<div className="campaign-item__config">
				<div className="campaign-item__duration">
					<div className="campaign-item__duration-value">123 todo</div>
					<div className="campaign-item__duration-label">Overall spending</div>
				</div>
				<div className="campaign-item__audience">
					<div className="campaign-item__audience-value">4.44% todo</div>
					<div className="campaign-item__audience-label">Click-through rate</div>
				</div>
				<div className="campaign-item__url">
					<div className="campaign-item__clicks-value">$56 todo ($23 left)</div>
					<div className="campaign-item__clicks-label">Budget</div>
				</div>
			</div>
			<div className="campaign-item__payment-and-action">
				<Button isLink isDestructive>
					Stop the campaign
				</Button>
			</div>
		</FoldableCard>
	);
}
