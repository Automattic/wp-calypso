import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

/**
 * Returns hosting name and description with given product slug.
 * @param slug
 * @returns
 */
export default function useHostingDescription( slug: string ): {
	name: TranslateResult;
	description: TranslateResult;
} {
	const translate = useTranslate();

	return useMemo( () => {
		let description = '';
		let name = '';

		switch ( slug ) {
			case 'pressable-hosting':
				name = 'Pressable';
				description = translate(
					'9 custom plans built for agencies that include an intuitive control panel, easy site migration, staging environments, performance tools, and flexible upgrades & downgrades. '
				);
				break;
			case 'wpcom-hosting':
				name = 'Wordpress.com';
				description = translate(
					'IncUnbeatable uptime, unmetered bandwidth, and everything you need to streamline your development process, baked in. Perfect uptime. Fastest WP Bench score. A+ SSL grade.'
				);
				break;
		}

		return {
			name,
			description,
		};
	}, [ slug, translate ] );
}
