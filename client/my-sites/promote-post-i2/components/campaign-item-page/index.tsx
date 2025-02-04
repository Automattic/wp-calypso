import { CALYPSO_CONTACT } from '@automattic/urls';
import { translate, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/components/notice';
import { useCampaignsQuery } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CampaignItemDetails from '../campaign-item-details';
import './style.scss';
import MainWrapper from '../main-wrapper';

interface Props {
	campaignId: number;
}

const noCampaignListMessage = translate(
	'There was a problem obtaining the campaign. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when filling out domain checkout contact details form',
	}
);

export default function CampaignItemPage( props: Props ) {
	const { campaignId } = props;
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const campaignQuery = useCampaignsQuery( siteId || 0, campaignId );
	const { data: campaign } = campaignQuery;
	const { isLoading: campaignsIsLoading, isError } = campaignQuery;

	if ( isError ) {
		return (
			<MainWrapper>
				<Notice
					className="promote-post-notice"
					status="is-error"
					icon="mention"
					showDismiss={ false }
				>
					{ noCampaignListMessage }
				</Notice>
			</MainWrapper>
		);
	}

	const isLoading = ! campaign || campaignsIsLoading;

	return (
		<MainWrapper>
			<DocumentHead title={ translate( 'Advertising - Campaign details' ) } />
			{ ! isLoading && campaign && (
				<CampaignItemDetails isLoading={ isLoading } siteId={ +siteId } campaign={ campaign } />
			) }
		</MainWrapper>
	);
}
