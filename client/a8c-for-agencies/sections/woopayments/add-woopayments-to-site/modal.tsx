import { Button } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { A4A_WOOPAYMENTS_SITE_SETUP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useIssueAndAssignLicenses from 'calypso/a8c-for-agencies/sections/marketplace/products-overview-v2/hooks/use-issue-and-assign-licenses';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';

const AddWooPaymentsToSiteModal = ( { onClose }: { onClose: () => void } ) => {
	const translate = useTranslate();

	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const { issueAndAssignLicenses, isReady: isIssueAndAssignReady } = useIssueAndAssignLicenses(
		selectedSite ? { ID: selectedSite.rawSite.blog_id, domain: selectedSite.site } : null,
		{
			redirectTo: addQueryArgs( A4A_WOOPAYMENTS_SITE_SETUP_LINK, {
				site_id: selectedSite?.rawSite.blog_id,
			} ),
		}
	);

	const handleAddSite = () => {
		if ( selectedSite ) {
			issueAndAssignLicenses( [
				{
					slug: 'woocommerce-woopayments',
					quantity: 1,
				},
			] );
		}
	};

	return (
		<A4AModal
			title={ translate( 'Which site would you like to add WooPayments to?' ) }
			subtile={ translate(
				"If you don't see the site in the list, connect it first via the Sites Dashboard."
			) }
			onClose={ onClose }
			extraActions={
				<Button
					variant="primary"
					onClick={ handleAddSite }
					disabled={ ! selectedSite || ! isIssueAndAssignReady }
					isBusy={ ! isIssueAndAssignReady }
				>
					{ translate( 'Add WooPayments to selected site' ) }
				</Button>
			}
		>
			<AddWooPaymentsToSiteTable
				setSelectedSite={ setSelectedSite }
				selectedSite={ selectedSite }
			/>
		</A4AModal>
	);
};

export default AddWooPaymentsToSiteModal;
