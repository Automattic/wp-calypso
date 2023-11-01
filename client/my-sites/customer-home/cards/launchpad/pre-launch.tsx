import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useState } from 'react';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useSelector, useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CelebrateLaunchModal from '../../components/celebrate-launch-modal';
import CustomerHomeLaunchpad from '.';
import type { AppState } from 'calypso/types';

const LaunchpadPreLaunch = (): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || '';
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';
	const [ celebrateLaunchModalIsOpen, setCelebrateLaunchModalIsOpen ] = useState( false );
	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const dispatch = useDispatch();
	const layout = useHomeLayoutQuery( siteId || null );

	const setCelebrateLaunchModalIsOpenWrapper = ( isOpen: boolean ) => {
		// Triggered when the site is launched (true) and when the modal is closed (false)
		setCelebrateLaunchModalIsOpen( isOpen );

		if ( isOpen ) {
			// Site launched, update site data
			dispatch( requestSite( siteId ) );
		} else {
			// Modal closed, update the launchpad data/checklist
			layout?.refetch();
		}
	};

	const onSiteLaunched = () => {
		setCelebrateLaunchModalIsOpenWrapper( true );
		// currently the action to update site_launch status on atomic doesn't fire
		// this is a workaround until that is fixed
		if ( site?.is_wpcom_atomic ) {
			updateLaunchpadSettings( siteId, {
				checklist_statuses: { site_launched: true },
			} );
		}
	};

	return (
		<>
			<CustomerHomeLaunchpad checklistSlug={ checklistSlug } onSiteLaunched={ onSiteLaunched } />
			{ celebrateLaunchModalIsOpen && (
				<CelebrateLaunchModal
					setModalIsOpen={ setCelebrateLaunchModalIsOpenWrapper }
					site={ site }
					allDomains={ allDomains }
				/>
			) }
		</>
	);
};

export default LaunchpadPreLaunch;
