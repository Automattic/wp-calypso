import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useBundleLicensesQuery from 'calypso/state/partner-portal/licenses/hooks/use-bundle-licenses-query';
import LicensePreview, { LicensePreviewPlaceholder } from '../license-preview';

interface Props {
	parentLicenseId: number;
}

export default function BundleDetails( { parentLicenseId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { licenses, total, loadMore, isLoading } = useBundleLicensesQuery( parentLicenseId );

	const onLoadMore = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_bundle_load_more' ) );
		loadMore?.();
	}, [ dispatch, loadMore ] );

	return (
		<div className="bundle-details">
			{ licenses.map( ( item ) => (
				<LicensePreview
					isChildLicense
					key={ item.licenseId }
					licenseKey={ item.licenseKey }
					product={ item.product }
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

			{ isLoading && <LicensePreviewPlaceholder /> }

			{ loadMore && (
				<CompactCard className="bundle-details__footer">
					<Button compact onClick={ onLoadMore } disabled={ isLoading }>
						{ translate( 'Load more (%(remainingItems)d)', {
							args: { remainingItems: total - licenses.length },
						} ) }
					</Button>
				</CompactCard>
			) }
		</div>
	);
}
