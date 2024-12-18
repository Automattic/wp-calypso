import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { A4A_LICENSES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { internalToPublicLicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/lib/license-filters';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LayoutNavigation, { LayoutNavigationTabs } from 'calypso/layout/multi-sites-dashboard/nav';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LicenseListContext from '../licenses-overview/context';

function LicenseStateFilter( { data }: { data: Record< LicenseFilter, number > } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { filter } = useContext( LicenseListContext );

	const navItems = [
		{
			key: LicenseFilter.NotRevoked,
			label: translate( 'All Active' ),
		},
		{
			key: LicenseFilter.Detached,
			label: translate( 'Unassigned' ),
		},
		{
			key: LicenseFilter.Attached,
			label: translate( 'Assigned' ),
		},
		{
			key: LicenseFilter.Revoked,
			label: translate( 'Revoked' ),
		},
	].map( ( navItem ) => ( {
		...navItem,
		count: data?.[ navItem.key ] || 0,
		selected: filter === navItem.key,
		path: `${ A4A_LICENSES_LINK }/${ internalToPublicLicenseFilter( navItem.key ) }`,
		onClick: () => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_license_list_state_filter_click', {
					status: navItem.key,
				} )
			);
		},
		children: navItem.label,
	} ) );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];
	const selectedItemProps = {
		selectedText: selectedItem.label,
		selectedCount: selectedItem.count,
	};

	return (
		<LayoutNavigation { ...selectedItemProps }>
			<LayoutNavigationTabs { ...selectedItemProps } items={ navItems } />
		</LayoutNavigation>
	);
}

export default LicenseStateFilter;
