import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { getLocaleVariantOrLanguage, shouldDisplayCommunityTranslator } from './languages';

export default function ThanksToCommunityTranslator( { locale }: { locale?: string } ) {
	if ( ! locale || ! shouldDisplayCommunityTranslator( locale ) ) {
		return null;
	}

	const language = getLocaleVariantOrLanguage( locale );
	if ( ! language ) {
		return null;
	}

	return (
		<>
			<br />
			{ createInterpolateElement(
				sprintf(
					/* translators: %s: selected interface language */
					__(
						'Thanks to all our <externalLink>community members who helped translate to %s</externalLink>'
					),
					language.name
				),
				{
					externalLink: (
						<ExternalLink
							href={ `https://translate.wordpress.com/translators/?contributor_locale=${ language.langSlug }` }
							children={ null }
						/>
					),
				}
			) }
		</>
	);
}
