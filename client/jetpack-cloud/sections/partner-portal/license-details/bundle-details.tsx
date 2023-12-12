import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useBundleLicensesQuery from 'calypso/state/partner-portal/licenses/hooks/use-bundle-licenses-query';
import LicensePreview, { LicensePreviewPlaceholder } from '../license-preview';

interface Props {
	parentLicenseId: number;
}

export default function BundleDetails( { parentLicenseId }: Props ) {
	const translate = useTranslate();
	const { licenses, total, loadMore, fetching } = useBundleLicensesQuery( parentLicenseId );

	return (
		<div className="bundle-details">
			{ licenses.map( ( item ) => (
				<LicensePreview
					isChildLicense
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
			) ) }

			{ fetching && <LicensePreviewPlaceholder /> }

			{ loadMore && (
				<CompactCard className="bundle-details__footer">
					<Button compact onClick={ loadMore } disabled={ fetching }>
						{ translate( 'Load more (%(remainingItems)d)', {
							args: { remainingItems: total - licenses.length },
						} ) }
					</Button>
				</CompactCard>
			) }
		</div>
	);
}
