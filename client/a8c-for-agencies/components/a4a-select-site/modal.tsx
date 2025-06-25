import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { type SiteItem } from 'calypso/a8c-for-agencies/sections/migrations/hooks/use-fetch-all-managed-sites';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4ASelectSiteTable from './site-table';
import type { SelectSiteModalProps } from './types';

const SelectSiteModal = ( {
	onClose,
	onSiteSelect,
	title,
	subtitle,
	selectedSiteId,
}: SelectSiteModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSite, setSelectedSite ] = useState< SiteItem | null >( null );

	const handleSelectSite = () => {
		if ( selectedSite ) {
			onSiteSelect( {
				blogId: selectedSite.rawSite.blog_id,
				domain: selectedSite.site,
				managedSiteId: selectedSite.id,
			} );
			onClose();
		}
	};

	return (
		<A4AModal
			title={ title || translate( 'Select a site' ) }
			subtile={
				subtitle ||
				translate(
					"If you don't see the site in the list, connect it first via the {{a}}Sites Dashboard{{/a}}.",
					{
						components: {
							a: (
								<a
									href={ A4A_SITES_LINK }
									onClick={ () =>
										dispatch(
											recordTracksEvent( 'calypso_a4a_select_site_modal_sites_dashboard_click' )
										)
									}
								/>
							),
						},
					}
				)
			}
			onClose={ onClose }
			extraActions={
				<Button variant="primary" onClick={ handleSelectSite } disabled={ ! selectedSite }>
					{ translate( 'Select site' ) }
				</Button>
			}
		>
			<A4ASelectSiteTable
				selectedSite={ selectedSite }
				setSelectedSite={ setSelectedSite }
				selectedSiteId={ selectedSiteId }
			/>
		</A4AModal>
	);
};

export default SelectSiteModal;
