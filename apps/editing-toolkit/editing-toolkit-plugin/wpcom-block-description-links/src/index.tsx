import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { ReactElement, JSXElementConstructor } from 'react';
import blockLinks from './block-links-map';
import DescriptionSupportLink from './inline-support-link';

declare global {
	interface Window {
		wpcomBlockDescriptionLinksLocale: string;
	}
}

const addBlockSupportLinks = (
	settings: {
		[ key: string ]: string | ReactElement< string | JSXElementConstructor< any > >;
	},
	name: string
) => {
	// If block has a parent, use the parents name in the switch. This will apply the link to all nested blocks.
	const isChild = settings[ 'parent' ];
	const blockName = isChild ? settings[ 'parent' ].toString() : name;

	if ( blockLinks[ blockName ] ) {
		const localizedUrl = localizeUrl(
			blockLinks[ blockName ],
			window.wpcomBlockDescriptionLinksLocale
		);
		const descriptionWithLink = createInterpolateElement( '<InlineSupportLink />', {
			InlineSupportLink: (
				<DescriptionSupportLink title={ String( settings.title ) } url={ localizedUrl }>
					{ settings.description }
				</DescriptionSupportLink>
			),
		} );

		settings.description = descriptionWithLink;
	}

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/add-block-support-link',
	addBlockSupportLinks
);
