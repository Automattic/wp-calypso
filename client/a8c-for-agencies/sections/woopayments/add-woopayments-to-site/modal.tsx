import { Button } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import {
	A4A_WOOPAYMENTS_SITE_SETUP_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useIssueAndAssignLicenses from 'calypso/a8c-for-agencies/sections/marketplace/products-overview/hooks/use-issue-and-assign-licenses';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';

const AddWooPaymentsToSiteModal = ( { onClose }: { onClose: () => void } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const { issueAndAssignLicenses, isLoading } = useIssueAndAssignLicenses(
		selectedSite ? { ID: selectedSite.rawSite.blog_id, domain: selectedSite.site } : null,
		{
			redirectTo: addQueryArgs( A4A_WOOPAYMENTS_SITE_SETUP_LINK, {
				site_id: selectedSite?.rawSite.blog_id,
			} ),
		}
	);

	const handleAddSite = () => {
		if ( selectedSite ) {
			dispatch( recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' ) );
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
				"If you don't see the site in the list, connect it first via the {{a}}Sites Dashboard{{/a}}.",
				{
					components: {
						a: (
							<a
								href={ A4A_SITES_LINK }
								onClick={ () =>
									dispatch(
										recordTracksEvent(
											'calypso_a4a_woopayments_add_site_modal_sites_dashboard_click'
										)
									)
								}
							/>
						),
					},
				}
			) }
			onClose={ onClose }
			extraActions={
				<Button
					variant="primary"
					onClick={ handleAddSite }
					disabled={ ! selectedSite || isLoading }
					isBusy={ isLoading }
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
