import { translate, useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import usePromoteParams from 'calypso/data/promote-post/use-promote-params';
import useCampaignsQueryNew from 'calypso/data/promote-post/use-promote-post-campaigns-query-new';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CampaignItemDetails from '../campaign-item-details';
import './style.scss';

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
	const { isModalOpen, selectedSiteId, selectedPostId, keyValue } = usePromoteParams();

	const currentQuery = useSelector( getCurrentQueryArguments );
	const sourceQuery = currentQuery?.[ 'source' ];
	const source = sourceQuery ? sourceQuery.toString() : undefined;
	const { isLoading: campaignsIsLoading, isError } = campaignQuery;
	const { data: campaign } = campaignQuery;

	useEffect( () => {
		document.querySelector( 'body' )?.classList.add( 'is-section-promote-post-i2' );
	}, [] );

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

	if ( campaignsIsLoading ) {
		return null;
	}

	return (
		<Main wideLayout className="promote-post-i2">
			<DocumentHead title={ translate( 'Advertising - Campaign details' ) } />
			<CampaignItemDetails siteId={ +siteId } campaign={ campaign } />

			{ selectedSiteId && selectedPostId && keyValue && (
				<BlazePressWidget
					isVisible={ isModalOpen }
					siteId={ selectedSiteId }
					postId={ selectedPostId }
					keyValue={ keyValue }
					source={ source }
				/>
			) }
		</Main>
	);
}
