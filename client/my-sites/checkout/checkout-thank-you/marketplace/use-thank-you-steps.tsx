import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThankYouSteps } from 'calypso/components/thank-you/types';
import useMarketplaceAdditionalSteps from 'calypso/my-sites/marketplace/pages/marketplace-plugin-install/use-marketplace-additional-steps';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { usePluginsThankYouData } from './use-plugins-thank-you-data';
import { useThemesThankYouData } from './use-themes-thank-you-data';
import { hasMultipleProductTypes } from './utils';

export function useThankYouSteps( {
	pluginSlugs,
	themeSlugs,
}: {
	pluginSlugs: Array< string >;
	themeSlugs: Array< string >;
} ): ThankYouSteps {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	const multipleProductTypes = hasMultipleProductTypes( [ pluginSlugs, themeSlugs ] );
	const additionalSteps = useMarketplaceAdditionalSteps();
	const randomElement = ( arr: string[] ) => arr[ Math.floor( Math.random() * arr.length ) ];

	const [ , , , pluginsProgressbarSteps ] = usePluginsThankYouData( pluginSlugs );
	const [ , , , themesProgressbarSteps ] = useThemesThankYouData( themeSlugs );

	const defaultSteps = useMemo(
		() => {
			if ( isJetpack ) {
				return [ randomElement( additionalSteps ) ];
			}

			return [
				randomElement( additionalSteps ), // Transferring to Atomic
				randomElement( additionalSteps ), // Transferring to Atomic
				randomElement( additionalSteps ), // Transferring to Atomic
				randomElement( additionalSteps ),
			];
		},
		// We intentionally don't set `isJetpack` as dependency to keep the same steps after the Atomic transfer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ translate ]
	);

	const steps = multipleProductTypes
		? defaultSteps
		: [ ...pluginsProgressbarSteps, ...themesProgressbarSteps ];

	return { steps, additionalSteps };
}
