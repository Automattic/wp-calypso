import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import ListEnd from 'calypso/components/list-end';
import Notice from 'calypso/components/notice';
import { Campaign } from 'calypso/data/promote-post/types';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import CampaignItem from 'calypso/my-sites/promote-post/components/campaign-item';
import './style.scss';
import CampaignsEmpty from 'calypso/my-sites/promote-post/components/campaigns-empty';
import EmptyPromotionList from '../empty-promotion-list';

const noCampaignListMessage = translate(
	'There was a problem obtaining the campaign list. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when filling out domain checkout contact details form',
	}
);

export default function CampaignsList( {
	isLoading,
	isError,
	hasLocalUser,
	campaigns,
	expandedCampaigns,
	setExpandedCampaigns,
}: {
	isLoading: boolean;
	hasLocalUser: boolean;
	isError: boolean;
	campaigns: Campaign[];
	expandedCampaigns: number[];
	setExpandedCampaigns: ( campaigns: number[] ) => void;
} ) {
	const memoCampaigns = useMemo< Campaign[] >( () => campaigns || [], [ campaigns ] );

	const isEmpty = ! memoCampaigns.length;

	if ( isError && hasLocalUser ) {
		return (
			<Notice status="is-error" icon="mention">
				{ noCampaignListMessage }
			</Notice>
		);
	}

	if ( isLoading ) {
		return (
			<div className="campaigns-list__loading-container">
				<SitePlaceholder />
			</div>
		);
	}

	if ( ! memoCampaigns.length ) {
		return <EmptyPromotionList type="campaigns" />;
	}

	const handleClickCampaign = ( isExpanded: boolean, campaign: Campaign ) => {
		if ( isExpanded ) {
			setExpandedCampaigns( [ ...expandedCampaigns, campaign.campaign_id ] );
		} else {
			setExpandedCampaigns( expandedCampaigns.filter( ( id ) => id !== campaign.campaign_id ) );
		}
	};

	return (
		<>
			{ isEmpty && ! isError && <CampaignsEmpty /> }
			{ ! isEmpty && ! isError && (
				<>
					{ memoCampaigns.map( function ( campaign ) {
						return (
							<CampaignItem
								key={ campaign.campaign_id }
								campaign={ campaign }
								expanded={ expandedCampaigns.includes( campaign.campaign_id ) }
								onClickCampaign={ ( isExpanded: boolean ) =>
									handleClickCampaign( isExpanded, campaign )
								}
							/>
						);
					} ) }
					<ListEnd />
				</>
			) }
		</>
	);
}
