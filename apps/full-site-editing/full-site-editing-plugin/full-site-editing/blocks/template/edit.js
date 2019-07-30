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
import { BlockEdit } from '@wordpress/editor';
import { Button, Placeholder, Spinner, Disabled } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { Fragment, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';

const TemplateEdit = compose(
	withState( { templateClientId: null } ),
	withSelect( ( select, { attributes, templateClientId } ) => {
		const { getEntityRecord } = select( 'core' );
		const { getCurrentPostId } = select( 'core/editor' );
		const { getBlock } = select( 'core/block-editor' );

		const { templateId } = attributes;
		const currentPostId = getCurrentPostId();
		const template = templateId && getEntityRecord( 'postType', 'wp_template_part', templateId );
		const editTemplatePartUrl = addQueryArgs( fullSiteEditing.editTemplatePartBaseUrl, {
			post: templateId,
			fse_parent_post: currentPostId,
		} );

		return {
			currentPostId,
			editTemplatePartUrl,
			template,
			templateBlock: getBlock( templateClientId ),
			templateTitle: get( template, [ 'title', 'rendered' ], '' ),
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
		editTemplatePartUrl,
		receiveTemplateBlocks,
		template,
		templateBlock,
		templateTitle,
	} ) => {
		if ( ! template ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			);
		}

		useEffect( () => {
			receiveTemplateBlocks();
		} );

		const { align, className } = attributes;

		return (
			<div
				className={ classNames( 'template-block', className, {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ templateBlock && (
					<Fragment>
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
						<Placeholder
							className="template-block__overlay"
							instructions={ __(
								'This block is part of your site template and may appear on multiple pages.'
							) }
						>
							<Button href={ editTemplatePartUrl } isDefault>
								{ sprintf( __( 'Edit %s' ), templateTitle ) }
							</Button>
						</Placeholder>
					</Fragment>
				) }
			</div>
		);
	}
);

export default TemplateEdit;
