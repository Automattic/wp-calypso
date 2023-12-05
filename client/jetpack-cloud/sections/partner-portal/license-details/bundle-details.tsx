import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useBundleLicensesQuery from 'calypso/state/partner-portal/licenses/hooks/use-bundle-licenses-query';
import LicensePreview, { LicensePreviewPlaceholder } from '../license-preview';

interface Props {
	parentLicenseId: number;
	size: number;
}

export default function BundleDetails( { parentLicenseId, size }: Props ) {
	const { data } = useBundleLicensesQuery( parentLicenseId );

	if ( ! data ) {
		return <LicensePreviewPlaceholder />;
	}

	return data.map( ( item ) => (
		<LicensePreview
			isChildLicense
			bundleGroupSize={ size }
			key={ item.licenseId }
			licenseKey={ item.licenseKey }
			product={ item.product }
			username={ item.username }
			blogId={ item.blogId }
			siteUrl={ item.siteUrl }
			hasDownloads={ item.hasDownloads }
			issuedAt={ item.issuedAt }
			attachedAt={ item.attachedAt }
			revokedAt={ item.revokedAt }
			licenseType={
				item.ownerType === LicenseType.Standard ? LicenseType.Standard : LicenseType.Partner
			}
		/>
	) );
}
