import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function OverviewHeaderActions() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isNarrowView = useBreakpoint( '<660px' );

	return (
		<div className="overview-header__actions">
			<AddNewSiteButton
				showMainButtonLabel={ ! isNarrowView }
				onClickAddNewSite={ () =>
					dispatch( recordTracksEvent( 'calypso_a4a_overview_add_new_site_click' ) )
				}
				onClickWpcomMenuItem={ () =>
					dispatch( recordTracksEvent( 'calypso_a4a_overview_create_wpcom_site_click' ) )
				}
				onClickJetpackMenuItem={ () =>
					dispatch( recordTracksEvent( 'calypso_a4a_overview_connect_jetpack_site_click' ) )
				}
				onClickUrlMenuItem={ () =>
					dispatch( recordTracksEvent( 'calypso_a4a_overview_connect_url_site_click' ) )
				}
			/>
			{ ! isNarrowView && (
				<Button
					primary
					href={ A4A_MARKETPLACE_PRODUCTS_LINK }
					onClick={ () => {
						dispatch( recordTracksEvent( 'calypso_a4a_overview_add_products_click' ) );
					} }
				>
					{ translate( 'Add products' ) }
				</Button>
			) }
		</div>
	);
}
