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
				name = translate( 'Pressable' );
				description = translate(
					'Best for developers and agencies who need advanced hosting controls and management tools.'
				);
				break;
			case 'wpcom-hosting':
				name = translate( 'WordPress.com' );
				description = translate(
					'Best for those who want optimized, hassle-free WordPress hosting.'
				);
				break;
		}

		return {
			name,
			description,
		};
	}, [ slug, translate ] );
}
