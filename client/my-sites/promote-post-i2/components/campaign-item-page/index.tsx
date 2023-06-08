import { translate, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/components/notice';
import useCampaignsQueryNew from 'calypso/data/promote-post/use-promote-post-campaigns-query-new';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
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
	const campaignQuery = useCampaignsQueryNew( siteId || 0, campaignId );
	const { isLoading: campaignsIsLoading, isError } = campaignQuery;
	const { data: campaign } = campaignQuery;

	if ( isError ) {
		return (
			<Notice status="is-error" icon="mention">
				{ noCampaignListMessage }
			</Notice>
		);
	}

	if ( ! campaign || campaignsIsLoading ) {
		return <CampaignItemDetails isLoading={ true } />;
	}

	return (
		<MainWrapper>
			<DocumentHead title={ translate( 'Advertising - Campaign details' ) } />
			<CampaignItemDetails siteId={ +siteId } campaign={ campaign } />
		</MainWrapper>
	);
}
