import config from '@automattic/calypso-config';
import { useLayoutEffect } from 'react';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import UpgradePlanLoader from './upgrade-plan-loader';
import type { UpgradePlanDetailsProps } from './types';
import type { FC } from 'react';

const withUpgradePlanDetailsQueries =
	( WrappedComponent: FC< UpgradePlanDetailsProps > ) => ( props: UpgradePlanDetailsProps ) => {
		const siteId = Number( useSiteIdParam() ) ?? 0;

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

		return (
			<div>
				<QuerySitePlans />
				<WrappedComponent { ...props } />
			</div>
		);
	};

export default withUpgradePlanDetailsQueries;
