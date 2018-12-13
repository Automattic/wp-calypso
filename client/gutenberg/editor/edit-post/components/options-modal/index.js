/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { PostTaxonomies, PostExcerptCheck, PageAttributesCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Section from './section';
import { EnablePublishSidebarOption, EnablePanelOption } from './options';
import MetaBoxesSection from './meta-boxes-section';

const MODAL_NAME = 'edit-post/options';

export function OptionsModal( { isModalActive, closeModal } ) {
	if ( ! isModalActive ) {
		return null;
	}

	return (
		<Modal
			className="edit-post-options-modal"
			title={ <span className="edit-post-options-modal__title">{ __( 'Options' ) }</span> }
			closeLabel={ __( 'Close' ) }
			onRequestClose={ closeModal }
		>
			<Section title={ __( 'General' ) }>
				<EnablePublishSidebarOption label={ __( 'Enable Pre-publish Checks' ) } />
			</Section>
			<Section title={ __( 'Document Panels' ) }>
				<EnablePanelOption label={ __( 'Permalink' ) } panelName="post-link" />
				<PostTaxonomies
					taxonomyWrapper={ ( content, taxonomy ) => (
						<EnablePanelOption
							label={ get( taxonomy, [ 'labels', 'menu_name' ] ) }
							panelName={ `taxonomy-panel-${ taxonomy.slug }` }
						/>
					) }
				/>
				<EnablePanelOption label={ __( 'Featured Image' ) } panelName="featured-image" />
				<PostExcerptCheck>
					<EnablePanelOption label={ __( 'Excerpt' ) } panelName="post-excerpt" />
				</PostExcerptCheck>
				<EnablePanelOption label={ __( 'Discussion' ) } panelName="discussion-panel" />
				<PageAttributesCheck>
					<EnablePanelOption label={ __( 'Page Attributes' ) } panelName="page-attributes" />
				</PageAttributesCheck>
			</Section>
			<MetaBoxesSection title={ __( 'Advanced Panels' ) } />
		</Modal>
	);
}

export default compose(
	withSelect( select => ( {
		isModalActive: select( 'core/edit-post' ).isModalActive( MODAL_NAME ),
	} ) ),
	withDispatch( dispatch => {
		return {
			closeModal: () => dispatch( 'core/edit-post' ).closeModal(),
		};
	} )
)( OptionsModal );
