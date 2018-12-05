/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { filter, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Section from './section';
import { EnableCustomFieldsOption, EnablePanelOption } from './options';

export function MetaBoxesSection( { areCustomFieldsRegistered, metaBoxes, ...sectionProps } ) {
	// The 'Custom Fields' meta box is a special case that we handle separately.
	const thirdPartyMetaBoxes = filter( metaBoxes, ( { id } ) => id !== 'postcustom' );

	if ( ! areCustomFieldsRegistered && thirdPartyMetaBoxes.length === 0 ) {
		return null;
	}

	return (
		<Section { ...sectionProps }>
			{ areCustomFieldsRegistered && <EnableCustomFieldsOption label={ __( 'Custom Fields' ) } /> }
			{ map( thirdPartyMetaBoxes, ( { id, title } ) => (
				<EnablePanelOption key={ id } label={ title } panelName={ `meta-box-${ id }` } />
			) ) }
		</Section>
	);
}

export default withSelect( select => {
	const { getEditorSettings } = select( 'core/editor' );
	const { getAllMetaBoxes } = select( 'core/edit-post' );

	return {
		areCustomFieldsRegistered: getEditorSettings().enableCustomFields !== undefined,
		metaBoxes: getAllMetaBoxes(),
	};
} )( MetaBoxesSection );
