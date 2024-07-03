import { category, cog } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { createItem } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/utils';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
} from 'calypso/a8c-for-agencies/sections/partner-directory/constants';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

const isSelected = ( path: string, links: string[] ) => {
	return links.includes( path );
};

const usePartnerDirectoryMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );
	const hasDirectoryApproval = agency?.profile?.partner_directory_application?.directories.some(
		( { status } ) => status === 'approved'
	);

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: category,
					path: A4A_PARTNER_DIRECTORY_LINK,
					link: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }`,
					title: translate( 'Dashboard' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Partner Directory / Dashboard',
					},
					isSelected: isSelected( path, [
						`${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }`,
					] ),
				},
				path
			),
			// Only show the Agency details menu item if the agency has at least one directory approved
			...( hasDirectoryApproval
				? [
						createItem(
							{
								icon: cog,
								path: A4A_PARTNER_DIRECTORY_LINK,
								link: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
								title: translate( 'Agency details' ),
								trackEventProps: {
									menu_item: 'Automattic for Agencies / Partner Directory / Agency details',
								},
								isSelected: isSelected( path, [
									`${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
									`${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`,
								] ),
							},
							path
						),
				  ]
				: [] ),
		];
	}, [ hasDirectoryApproval, path, translate ] );
	return menuItems;
};

export default usePartnerDirectoryMenuItems;
