import { createInterpolateElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { ReactElement, JSXElementConstructor } from 'react';
import blockLinks from './block-links-map';
import DescriptionSupportLink from './inline-support-link';

const addBlockSupportLinks = (
	settings: {
		[ key: string ]: string | ReactElement< string | JSXElementConstructor< any > >;
	},
	name: string
) => {
	// If block has a parent, use the parents name in the switch. This will apply the link to all nested blocks.
	const isChild = settings[ 'parent' ];
	const blockName = isChild ? settings[ 'parent' ].toString() : name;

	if ( blockLinks.hasOwnProperty( blockName ) ) {
		const descriptionWithLink = createInterpolateElement( '<InlineSupportLink />', {
			InlineSupportLink: (
				<DescriptionSupportLink
					title={ String( settings.title ) }
					url={ blockLinks[ blockName ].url }
				>
					{ settings.description }
				</DescriptionSupportLink>
			),
		} );

		settings.description = descriptionWithLink || settings.description;
	}

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/add-block-support-link',
	addBlockSupportLinks
);
