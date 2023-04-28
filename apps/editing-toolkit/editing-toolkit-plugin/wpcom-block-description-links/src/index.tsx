import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { JSXElementConstructor, ReactElement } from 'react';
import blockLinks, {
	blockLinksWithVariations,
	childrenBlockLinksWithDifferentUrl,
} from './block-links-map';
import DescriptionSupportLink from './inline-support-link';

declare global {
	interface Window {
		wpcomBlockDescriptionLinksLocale: string;
	}
}

const createLocalizedDescriptionWithLearnMore = (
	title: string,
	description: string | ReactElement< string | JSXElementConstructor< any > >,
	url: string
) => {
	const localizedUrl = localizeUrl( url, window.wpcomBlockDescriptionLinksLocale );
	return createInterpolateElement( '<InlineSupportLink />', {
		InlineSupportLink: (
			<DescriptionSupportLink title={ String( title ) } url={ localizedUrl }>
				{ description }
			</DescriptionSupportLink>
		),
	} );
};

const processedBlocks: { [ key: string ]: true } = {};

const addBlockSupportLinks = (
	settings: {
		variations: Array< {
			description: string | ReactElement< string | JSXElementConstructor< any > >;
			name: string;
			title: string;
		} >;
	} & {
		[ key: string ]: string | ReactElement< string | JSXElementConstructor< any > >;
	},
	name: string
) => {
	// If block has a parent, use the parents name in the switch. This will apply the link to all nested blocks.
	const isChild = settings[ 'parent' ];
	const blockName = isChild ? settings[ 'parent' ].toString() : name;

	/**
	 * This is needed because the `blocks.registerBlockType` filter is also triggered for deprecations.
	 *
	 * When the block has deprecations, this filter is triggered multiple times, resulting the Learn more link being appended multiple times.
	 */
	if ( processedBlocks[ name ] ) {
		return settings;
	}

	processedBlocks[ name ] = true;

	const additonalDesc = childrenBlockLinksWithDifferentUrl[ name ] || blockLinks[ blockName ];

	/**
	 * Some elements are children, but have their own url for Learn More, and we want to show those.
	 */
	if ( additonalDesc ) {
		settings.description = createLocalizedDescriptionWithLearnMore(
			String( settings.title ),
			settings.description,
			additonalDesc
		);
	}

	if (
		blockLinksWithVariations[ name ] &&
		settings.variations &&
		Array.isArray( settings.variations )
	) {
		settings.variations = settings.variations.map(
			( variation: {
				title: string;
				name: string;
				description: string | ReactElement< string | JSXElementConstructor< any > >;
			} ) => {
				const link = blockLinksWithVariations[ name ][ variation.name ];

				if ( ! link ) {
					return variation;
				}

				variation.description = createLocalizedDescriptionWithLearnMore(
					variation.title,
					variation.description,
					link
				);

				return variation;
			}
		);
	}

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/add-block-support-link',
	addBlockSupportLinks
);
