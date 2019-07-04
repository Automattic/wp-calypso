/* eslint-disable wpcalypso/jsx-classname-namespace */
/* global fullSiteEditing */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { parse, createBlock } from '@wordpress/blocks';
import { BlockEdit } from '@wordpress/block-editor';
import { Button, IconButton, Placeholder, Toolbar, Spinner, Disabled } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { BlockControls } from '@wordpress/editor';
import { Fragment, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';
import './style.scss';

const TemplateEdit = compose(
	withState( { isEditing: false, templateClientId: null } ),
	withSelect( ( select, { attributes, templateClientId } ) => {
		const { getEntityRecord } = select( 'core' );
		const { getCurrentPostId } = select( 'core/editor' );
		const { getBlock } = select( 'core/block-editor' );

		const { templateId } = attributes;
		const template = templateId && getEntityRecord( 'postType', 'wp_template_part', templateId );

		return {
			currentPostId: getCurrentPostId(),
			template,
			templateBlock: getBlock( templateClientId ),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const { receiveBlocks } = dispatch( 'core/block-editor' );
		const { template, templateClientId, setState } = ownProps;

		return {
			receiveTemplateBlocks: () => {
				if ( ! template || templateClientId ) {
					return;
				}

				const templateBlocks = parse( get( template, [ 'content', 'raw' ], '' ) );
				const templateBlock =
					templateBlocks.length === 1
						? templateBlocks[ 0 ]
						: createBlock( 'core/template', {}, templateBlocks );

				receiveBlocks( [ templateBlock ] );
				setState( { templateClientId: templateBlock.clientId } );
			},
		};
	} )
)(
	( {
		attributes,
		currentPostId,
		isEditing,
		receiveTemplateBlocks,
		setAttributes,
		setState,
		template,
		templateBlock,
	} ) => {
		const isTemplate = 'wp_template' === fullSiteEditing.editorPostType;
		const { align, templateId } = attributes;
		const showToggleButton = ! isEditing || !! templateId;
		const showPlaceholder = isEditing || ! templateId;
		const showContent = ! isEditing && !! templateId && template;

		const editTemplatePartUrl = addQueryArgs( fullSiteEditing.editTemplatePartBaseUrl, {
			post: templateId,
			fse_parent_post: currentPostId,
		} );

		if ( ! isTemplate && templateId && ! template ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			);
		}

		useEffect( () => {
			receiveTemplateBlocks();
		} );

		const toggleEditing = () => setState( { isEditing: ! isEditing } );

		const onSelectTemplate = ( { id } ) => {
			setState( { isEditing: false } );
			setAttributes( { templateId: id } );
		};

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
							{ templateBlock && (
								<Disabled>
									<BlockEdit
										attributes={ templateBlock.attributes }
										block={ templateBlock }
										clientId={ templateBlock.clientId }
										isSelected={ false }
										name={ templateBlock.name }
										setAttributes={ noop }
									/>
								</Disabled>
							) }
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
	}
);

export default TemplateEdit;
