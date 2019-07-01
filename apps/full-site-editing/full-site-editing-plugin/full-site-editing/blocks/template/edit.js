/* eslint-disable wpcalypso/jsx-classname-namespace */
/* global fullSiteEditing */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, IconButton, Placeholder, Toolbar } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { BlockControls } from '@wordpress/editor';
import { Fragment, RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';
import './style.scss';

const TemplateEdit = compose(
	withSelect( ( select, { attributes } ) => {
		const { getEntityRecord } = select( 'core' );
		const { getCurrentPostId } = select( 'core/editor' );

		const { templateId } = attributes;
		return {
			currentPostId: getCurrentPostId(),
			template: templateId && getEntityRecord( 'postType', 'wp_template_part', templateId ),
		};
	} ),
	withState( { isEditing: false } )
)( ( { attributes, currentPostId, isEditing, template, setAttributes, setState } ) => {
	const { align, templateId } = attributes;

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onSelectTemplate = ( { id } ) => {
		setState( { isEditing: false } );
		setAttributes( { templateId: id } );
	};

	const showToggleButton = ! isEditing || !! templateId;
	const showPlaceholder = isEditing || ! templateId;
	const showContent = ! isEditing && !! templateId;
	const isTemplate = 'wp_template' === fullSiteEditing.editorPostType;

	const editTemplatePartUrl = addQueryArgs( fullSiteEditing.editTemplatePartBaseUrl, {
		post: templateId,
		fse_parent_post: currentPostId,
	} );

	return (
		<Fragment>
			{ showToggleButton && isTemplate && (
				<BlockControls>
					<Toolbar>
						<IconButton
							className={ classNames( 'components-icon-button components-toolbar__control', {
								'is-active': isEditing,
							} ) }
							label={ __( 'Change Template Part' ) }
							onClick={ toggleEditing }
							icon="edit"
						/>
					</Toolbar>
				</BlockControls>
			) }
			<div
				className={ classNames( 'template-block', {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ showPlaceholder && (
					<Placeholder
						icon="layout"
						label={ __( 'Template Part' ) }
						instructions={ __( 'Select a template part to display' ) }
					>
						<div className="template-block__selector">
							<PostAutocomplete
								initialValue={ get( template, [ 'title', 'rendered' ] ) }
								onSelectPost={ onSelectTemplate }
								postType="wp_template_part"
							/>
							{ !! template && (
								<a href={ editTemplatePartUrl }>
									{ sprintf( __( 'Edit "%s"' ), get( template, [ 'title', 'rendered' ], '' ) ) }
								</a>
							) }
						</div>
					</Placeholder>
				) }
				{ showContent && (
					<Fragment>
						<RawHTML className="template-block__content">
							{ get( template, [ 'content', 'rendered' ] ) }
						</RawHTML>
						{ ! isTemplate && (
							<Placeholder
								className="template-block__overlay"
								instructions={ __(
									'This block is part of your site template and may appear on multiple pages.'
								) }
							>
								<Button href={ editTemplatePartUrl } isDefault>
									{ sprintf( __( 'Edit %s' ), get( template, [ 'title', 'rendered' ], '' ) ) }
								</Button>
							</Placeholder>
						) }
					</Fragment>
				) }
			</div>
		</Fragment>
	);
} );

export default TemplateEdit;
