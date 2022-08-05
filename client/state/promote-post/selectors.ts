import 'calypso/state/promote-post/init';

export type CampaignStatus = -1 | 0 | 1 | 2;
export type Campaign = {
	content_config: {
		clickUrl: string;
		imageUrl: string;
		title: string;
		snippet: string;
	};
	content_image: string;
	start_date: string; // "2022-07-18T01:51:12.000Z"
	end_date: string;
	status_smart: CampaignStatus; // todo use real values
	target_urns: string;
	width: number;
	height: number;
	name: string;
	campaign_id: number;
	budget_cents: number;
	moderation_reason: string;
	moderation_status: number | null;
};

function getLocalState( state: any, siteId: number ) {
	return state?.promotePost?.campaigns?.[ siteId ];
}

export function getIsFetching( state: any, siteId: number ) {
	return getLocalState( state, siteId )?.isFetching ?? false;
}

export function getCampaigns( state: any, siteId: number ): Campaign[] {
	return getLocalState( state, siteId )?.campaigns ?? [];
}
