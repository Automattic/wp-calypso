import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { Skeleton } from './skeleton';
import type { UpgradePlanProps } from './types';
import type { FC } from 'react';

const withMigrationSticker =
	( WrappedComponent: FC< UpgradePlanProps > ) => ( props: UpgradePlanProps ) => {
		const { site } = props;
		const siteId = site.ID;

		const { addMigrationSticker, isPending } = useMigrationStickerMutation();

		useEffect( () => {
			if ( ! config.isEnabled( 'migration-flow/introductory-offer' ) ) {
				return;
			}

			if ( 0 !== siteId ) {
				addMigrationSticker( siteId );
			}
		}, [ addMigrationSticker, siteId ] );

		if ( isPending ) {
			return <Skeleton />;
		}

		return <WrappedComponent { ...props } />;
	};

export default withMigrationSticker;
