import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { ThankYouSteps } from 'calypso/components/thank-you/types';
import useMarketplaceAdditionalSteps from 'calypso/my-sites/marketplace/pages/marketplace-product-install/use-marketplace-additional-steps';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { hasMultipleProductTypes } from './utils';

export function useThankYouSteps( {
	pluginSlugs,
	themeSlugs,
	pluginsProgressbarSteps,
	themesProgressbarSteps,
}: {
	pluginSlugs: string[];
	themeSlugs: string[];
	pluginsProgressbarSteps: string[];
	themesProgressbarSteps: string[];
} ): ThankYouSteps {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	const multipleProductTypes = hasMultipleProductTypes( [ pluginSlugs, themeSlugs ] );
	const additionalSteps = useMarketplaceAdditionalSteps();
	const randomElement = ( arr: string[] ) => arr[ Math.floor( Math.random() * arr.length ) ];

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

	const steps = useMemo(
		() =>
			multipleProductTypes
				? defaultSteps
				: [
						...( pluginSlugs.length > 0 ? pluginsProgressbarSteps : [] ),
						...( themeSlugs.length > 0 ? themesProgressbarSteps : [] ),
				  ],
		[
			defaultSteps,
			multipleProductTypes,
			pluginSlugs.length,
			pluginsProgressbarSteps,
			themeSlugs.length,
			themesProgressbarSteps,
		]
	);

	return { steps, additionalSteps };
}
