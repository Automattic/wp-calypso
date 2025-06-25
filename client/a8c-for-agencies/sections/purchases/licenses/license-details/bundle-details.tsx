import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useBundleLicenses from 'calypso/a8c-for-agencies/data/purchases/use-bundle-licenses';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LicensePreview, { LicensePreviewPlaceholder } from '../license-preview';

interface Props {
	parentLicenseId: number;
}

export default function BundleDetails( { parentLicenseId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { licenses, total, loadMore, isLoading } = useBundleLicenses( parentLicenseId );

	const onLoadMore = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_license_details_bundle_load_more' ) );
		loadMore?.();
	}, [ dispatch, loadMore ] );

	return (
		<div className="bundle-details">
			{ licenses.map( ( item ) => (
				<LicensePreview
					isChildLicense
					key={ item.licenseId }
					license={ item }
					licenseType={
						item.ownerType === LicenseType.Standard ? LicenseType.Standard : LicenseType.Partner
					}
					productName={ item.product }
					productId={ item.productId }
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
