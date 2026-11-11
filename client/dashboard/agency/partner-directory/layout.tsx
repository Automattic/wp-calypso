import { activeAgencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import PartnerDirectoryTierUpsell from './tier-upsell';

export default function PartnerDirectoryLayout() {
	const { data: agency } = useSuspenseQuery( activeAgencyQuery() );

	if ( ! agency?.partner_directory?.allowed ) {
		return <PartnerDirectoryTierUpsell />;
	}

	return <Outlet />;
}
