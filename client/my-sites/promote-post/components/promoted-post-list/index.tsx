import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import EmptyContent from 'calypso/components/empty-content';
import ListEnd from 'calypso/components/list-end';
import SectionHeader from 'calypso/components/section-header';
import {
	Campaign,
	CampaignStatus,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import PromotedPost from 'calypso/my-sites/promote-post/components/promoted-post';
import './style.scss';

type Props = {
	campaigns: Campaign[];
};

// todo: use actual value
export const SmartStatuses: { [ status in CampaignStatus ]: string } = {
	'-1': 'All',
	0: 'pending',
	1: 'active',
	2: 'todo',
};

export default function PromotedPostList( { campaigns }: Props ) {
	const isEmpty = ! campaigns.length;
	return (
		<>
			{ isEmpty && (
				<EmptyContent
					title={ translate( 'No promoted posts' ) }
					line={ 'attributes.line' }
					action={ 'attributes.action' }
					actionURL={ 'attributes.actionURL' }
					// actionHoverCallback={ preloadEditor }
					illustration={ megaphoneIllustration }
					illustrationWidth={ 150 }
				/>
			) }
			{ ! isEmpty && (
				<>
					<SectionHeader label={ translate( 'Promoted Posts' ) }>
						<Button primary compact className="promoted-post-list__promote-new">
							{ translate( 'Promote new post' ) }
						</Button>
					</SectionHeader>
					{ campaigns.map( function ( campaign ) {
						return <PromotedPost key={ campaign.campaign_id } campaign={ campaign } />;
					} ) }
					<ListEnd />
				</>
			) }
		</>
	);
}
