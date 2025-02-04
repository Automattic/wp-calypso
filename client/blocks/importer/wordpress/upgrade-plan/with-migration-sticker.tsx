import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { Skeleton } from './skeleton';
import { VariantsSkeleton } from './skeleton/variants-skeleton';
import type { UpgradePlanProps } from './types';
import type { FC } from 'react';

const isIntroductoryOfferEnabled = config.isEnabled( 'migration-flow/introductory-offer' );

const withMigrationSticker =
	( WrappedComponent: FC< UpgradePlanProps > ) => ( props: UpgradePlanProps ) => {
		const { site, showVariants } = props;
		const siteId = site.ID;

		const {
			addMigrationSticker,
			addMutationRest: { isIdle, isPending },
			deleteMigrationSticker,
		} = useMigrationStickerMutation();

		useEffect( () => {
			if ( ! isIntroductoryOfferEnabled ) {
				return;
			}

			if ( 0 !== siteId ) {
				addMigrationSticker( siteId );
			}

			return () => {
				if ( 0 !== siteId ) {
					deleteMigrationSticker( siteId );
				}
			};
		}, [ addMigrationSticker, deleteMigrationSticker, siteId ] );

		if ( isIntroductoryOfferEnabled && ( isIdle || isPending ) ) {
			if ( ! showVariants ) {
				return <Skeleton />;
			}

			return <VariantsSkeleton />;
		}

		return <WrappedComponent { ...props } />;
	};

export default withMigrationSticker;
