import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { StepLinkCta } from './step-link-cta';
import { getMigrateGuruPageURL } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl?: string;
	hasMigrationKey: boolean;
	showMigrationKeyFallback: boolean;
}

export const MigrationKeyCta: FC< Props > = ( {
	fromUrl,
	hasMigrationKey,
	showMigrationKeyFallback,
} ) => {
	const translate = useTranslate();
	const site = useSite();
	const siteUrl = site?.URL ?? '';

	if ( ! fromUrl ) {
		return null;
	}

	if ( hasMigrationKey ) {
		return (
			<StepLinkCta url={ getMigrateGuruPageURL( fromUrl ) } linkname="enter-key">
				{ translate( 'Enter key' ) }
			</StepLinkCta>
		);
	} else if ( showMigrationKeyFallback ) {
		return (
			<StepLinkCta url={ getMigrateGuruPageURL( siteUrl ) } linkname="copy-key-fallback">
				{ translate( 'Get key' ) }
			</StepLinkCta>
		);
	}

	return null;
};
