/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

const addFSESiteLogoClassname = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		if ( props.attributes.className !== 'fse-site-logo' ) {
			return <BlockListBlock { ...props } />;
		}

		return <BlockListBlock { ...props } className="template__site-logo" />;
	};
}, 'addFSESiteLogoClassname' );

addFilter( 'editor.BlockListBlock', 'full-site-editing/blocks/template', addFSESiteLogoClassname );
