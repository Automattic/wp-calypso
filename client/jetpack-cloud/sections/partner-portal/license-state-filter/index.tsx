import { Count } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { internalToPublicLicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/lib/license-filters';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getLicenseCounts } from 'calypso/state/partner-portal/licenses/selectors';
import './style.scss';

function LicenseStateFilter() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { filter } = useContext( LicenseListContext );
	const counts = useSelector( getLicenseCounts );
	const basePath = '/partner-portal/licenses/';

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
		{
			key: LicenseFilter.Standard,
			label: translate( 'Standard licenses' ),
		},
	].map( ( navItem ) => ( {
		...navItem,
		count: counts[ navItem.key ] || 0,
		selected: filter === navItem.key,
		path: basePath + internalToPublicLicenseFilter( navItem.key ),
		onClick: () => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_license_list_state_filter_click', {
					status: navItem.key,
				} )
			);
		},
		children: navItem.label,
	} ) );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];

	return (
		<SectionNav
			applyUpdatedStyles
			selectedText={
				<span>
					{ selectedItem.label }
					<Count count={ selectedItem.count } compact />
				</span>
			}
			selectedCount={ selectedItem.count }
			className="license-state-filter"
		>
			<NavTabs selectedText={ selectedItem.label } selectedCount={ selectedItem.count }>
				{ navItems.map( ( props ) => (
					<NavItem { ...props } compactCount />
				) ) }
			</NavTabs>
		</SectionNav>
	);
}

export default LicenseStateFilter;
