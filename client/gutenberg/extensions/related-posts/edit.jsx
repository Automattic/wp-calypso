/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { BlockAlignmentToolbar, BlockControls, InspectorControls } from '@wordpress/editor';
import {
	Button,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	Toolbar,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ALIGNMENT_OPTIONS, DEFAULT_POSTS, MAX_POSTS_TO_SHOW } from './constants';

export default ( { attributes, className, setAttributes } ) => {
	const {
		align,
		displayContext,
		displayDate,
		displayThumbnails,
		headline,
		postLayout,
		postsToShow,
	} = attributes;

	const layoutControls = [
		{
			icon: 'grid-view',
			title: __( 'Grid View' ),
			onClick: () => setAttributes( { postLayout: 'grid' } ),
			isActive: postLayout === 'grid',
		},
		{
			icon: 'list-view',
			title: __( 'List View' ),
			onClick: () => setAttributes( { postLayout: 'list' } ),
			isActive: postLayout === 'list',
		},
	];

	const displayPosts = DEFAULT_POSTS.slice( 0, postsToShow );

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={ __( 'Related Posts Settings' ) }>
					<TextControl
						label={ __( 'Headline' ) }
						value={ headline }
						onChange={ value => setAttributes( { headline: value } ) }
					/>
					<ToggleControl
						label={ __( 'Display thumbnails' ) }
						checked={ displayThumbnails }
						onChange={ value => setAttributes( { displayThumbnails: value } ) }
					/>
					<ToggleControl
						label={ __( 'Display date' ) }
						checked={ displayDate }
						onChange={ value => setAttributes( { displayDate: value } ) }
					/>
					<ToggleControl
						label={ __( 'Display context (category or tag)' ) }
						checked={ displayContext }
						onChange={ value => setAttributes( { displayContext: value } ) }
					/>
					<RangeControl
						label={ __( 'Number of posts' ) }
						value={ postsToShow }
						onChange={ value =>
							setAttributes( { postsToShow: Math.min( value, MAX_POSTS_TO_SHOW ) } )
						}
						min={ 1 }
						max={ MAX_POSTS_TO_SHOW }
					/>
				</PanelBody>
			</InspectorControls>

			<BlockControls>
				<BlockAlignmentToolbar
					value={ align }
					onChange={ nextAlign => {
						setAttributes( { align: nextAlign } );
					} }
					controls={ ALIGNMENT_OPTIONS }
				/>
				<Toolbar controls={ layoutControls } />
			</BlockControls>

			<div className={ className }>
				{ headline.length ? <h3>{ headline }</h3> : null }

				<div
					className={ classNames( `${ className }__preview-items`, {
						'is-grid': postLayout === 'grid',
						[ `columns-${ postsToShow }` ]: postLayout === 'grid',
					} ) }
				>
					{ displayPosts.map( ( post, i ) => (
						<div className={ `${ className }__preview-post` } key={ i }>
							{ displayThumbnails && (
								<Button className={ `${ className }__preview-post-link` } isLink>
									<img src={ post.image } alt={ post.title } />
								</Button>
							) }
							<h4>
								<Button className={ `${ className }__preview-post-link` } isLink>
									{ post.title }
								</Button>
							</h4>
							{ displayDate && (
								<span className={ `${ className }__preview-post-date` }>{ post.date }</span>
							) }
							{ displayContext && <p>{ post.context }</p> }
						</div>
					) ) }
				</div>
			</div>
		</Fragment>
	);
};
