import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { StepLinkCta } from './step-link-cta';
import { getMigrationPluginPageURL } from './utils';

export const MigrationKeyCta = () => {
	const translate = useTranslate();
	const site = useSite();
	const siteUrl = site?.URL ?? '';

	return (
		<StepLinkCta url={ getMigrationPluginPageURL( siteUrl ) } linkname="copy-key-fallback">
			{ translate( 'Get key' ) }
		</StepLinkCta>
	);
};
