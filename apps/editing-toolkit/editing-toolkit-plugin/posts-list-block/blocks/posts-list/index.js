import { InspectorControls } from '@wordpress/block-editor';
import {
	registerBlockType,
	switchToBlockType,
	getPossibleBlockTransformations,
} from '@wordpress/blocks';
import { Placeholder, RangeControl, PanelBody, Notice } from '@wordpress/components';
import { select, dispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';
import { transforms, isValidHomepagePostsBlockType } from './transforms';

import './editor.scss';
import './style.scss';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path opacity=".87" fill="none" d="M0 0h24v24H0V0z" />
		<path d="M3 5v14h17V5H3zm4 2v2H5V7h2zm-2 6v-2h2v2H5zm0 2h2v2H5v-2zm13 2H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
	</svg>
);

registerBlockType( metadata.name, {
	title: __( 'Blog Posts Listing', 'full-site-editing' ),
	description: __( 'Displays your latest Blog Posts.', 'full-site-editing' ),
	icon: icon,
	category: 'layout',
	supports: {
		html: false,
		multiple: false,
		reusable: false,
		inserter: false,
	},
	attributes: metadata.attributes,
	edit: ( { attributes, setAttributes, clientId, isSelected } ) => {
		const block = select( 'core/block-editor' ).getBlock( clientId );

		// Find if any of possible transformations is into the Homepage Posts block.
		const possibleTransforms = getPossibleBlockTransformations( [ block ] );
		const homepagePostsTransform = possibleTransforms.find(
			( transform ) => transform && isValidHomepagePostsBlockType( transform.name )
		);
		const canBeUpgraded = !! homepagePostsTransform;

		const upgradeBlock = () => {
			dispatch( 'core/block-editor' ).replaceBlocks(
				block.clientId,
				switchToBlockType( block, homepagePostsTransform.name )
			);
		};

		return (
			<Fragment>
				{ canBeUpgraded && (
					<Notice
						actions={ [
							{
								label: __( 'Update Block', 'full-site-editing' ),
								onClick: upgradeBlock,
							},
						] }
						className="posts-list__notice"
						isDismissible={ false }
					>
						{ __(
							'An improved version of this block is available. Update for a better, more natural way to manage your blog post listings. There may be small visual changes.',
							'full-site-editing'
						) }
					</Notice>
				) }
				<Placeholder
					icon={ icon }
					label={ __( 'Your recent blog posts will be displayed here.', 'full-site-editing' ) }
				>
					{ isSelected ? (
						<RangeControl
							label={ __( 'Number of posts to show', 'full-site-editing' ) }
							value={ attributes.postsPerPage }
							onChange={ ( val ) => setAttributes( { postsPerPage: val } ) }
							min={ 1 }
							max={ 50 }
						/>
					) : null }
				</Placeholder>
				<InspectorControls>
					<PanelBody>
						<RangeControl
							label={ __( 'Number of posts', 'full-site-editing' ) }
							value={ attributes.postsPerPage }
							onChange={ ( val ) => setAttributes( { postsPerPage: val } ) }
							min={ 1 }
							max={ 50 }
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	},
	save: () => null,
	transforms,
} );
