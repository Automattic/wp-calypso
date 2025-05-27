import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SelectSiteTable, { type SiteItem } from './site-table';

type SelectSiteModalProps = {
	onClose: () => void;
	onSiteSelect: ( siteId: number, siteDomain: string ) => void;
	title?: string;
	subtitle?: string;
};

const SelectSiteModal = ( { onClose, onSiteSelect, title, subtitle }: SelectSiteModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSite, setSelectedSite ] = useState< SiteItem | null >( null );

	const handleSelectSite = () => {
		if ( selectedSite ) {
			onSiteSelect( selectedSite.id, selectedSite.site );
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
											recordTracksEvent( 'calypso_select_site_modal_sites_dashboard_click' )
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
			<SelectSiteTable setSelectedSite={ setSelectedSite } selectedSite={ selectedSite } />
		</A4AModal>
	);
};

export default SelectSiteModal;
