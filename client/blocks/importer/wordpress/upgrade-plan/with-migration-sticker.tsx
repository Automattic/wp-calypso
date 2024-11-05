import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { useMigrationIntroductoryOfferMutation } from 'calypso/data/site-migration/landing/use-introductory-offer-mutation';
import { Skeleton } from './skeleton';
import type { UpgradePlanProps } from './types';
import type { FC } from 'react';

const isIntroductoryOfferEnabled = config.isEnabled( 'migration-flow/introductory-offer' );

const withMigrationSticker =
	( WrappedComponent: FC< UpgradePlanProps > ) => ( props: UpgradePlanProps ) => {
		const { site } = props;
		const siteId = site.ID;

		const {
			addMigrationSticker,
			addMutationRest: { isIdle, isPending },
			deleteMigrationSticker,
		} = useMigrationIntroductoryOfferMutation();

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
			return <Skeleton />;
		}

		return <WrappedComponent { ...props } />;
	};

export default withMigrationSticker;
