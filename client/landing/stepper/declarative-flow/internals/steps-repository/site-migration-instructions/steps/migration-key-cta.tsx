import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { StepLinkCta } from './step-link-cta';
import { getMigrateGuruPageURL } from './utils';

export const MigrationKeyCta = () => {
	const translate = useTranslate();
	const site = useSite();
	const siteUrl = site?.URL ?? '';

	return (
		<StepLinkCta url={ getMigrateGuruPageURL( siteUrl ) } linkname="copy-key-fallback">
			{ translate( 'Get key' ) }
		</StepLinkCta>
	);
};
