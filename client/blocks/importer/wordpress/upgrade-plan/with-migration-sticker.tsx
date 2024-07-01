import config from '@automattic/calypso-config';
import { useLayoutEffect } from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import UpgradePlanLoader from './upgrade-plan-loader';
import type { UpgradePlanDetailsProps } from './types';
import type { FC } from 'react';

const withMigrationSticker =
	( WrappedComponent: FC< UpgradePlanDetailsProps > ) => ( props: UpgradePlanDetailsProps ) => {
		const { siteId } = props;

		const { addMigrationSticker, isPending } = useMigrationStickerMutation();

		// It uses the layout effect to avoid the screen flickering because isPending starts as `true` and changes only after this effect.
		useLayoutEffect( () => {
			if ( ! config.isEnabled( 'migration-flow/introductory-offer' ) ) {
				return;
			}

			if ( 0 !== siteId ) {
				addMigrationSticker( siteId );
			}
		}, [ addMigrationSticker, siteId ] );

		if ( isPending ) {
			return <UpgradePlanLoader />;
		}

		return <WrappedComponent { ...props } />;
	};

export default withMigrationSticker;
