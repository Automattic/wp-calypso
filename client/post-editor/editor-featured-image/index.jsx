/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' ),
	EditorMediaModal = require( 'post-editor/media-modal' ),
	EditorDrawerWell = require( 'post-editor/editor-drawer-well' ),
	PostActions = require( 'lib/posts/actions' ),
	PostUtils = require( 'lib/posts/utils' ),
	stats = require( 'lib/posts/stats' ),
	AccordionSection = require( 'components/accordion/section' ),
	EditorFeaturedImagePreviewContainer = require( './preview-container' );

var EditorFeaturedImage = React.createClass( {

	propTypes: {
		maxWidth: React.PropTypes.number,
		site: React.PropTypes.object,
		post: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			editable: false,
			maxWidth: 450
		};
	},

	getInitialState: function() {
		return {
			isSelecting: false
		};
	},

	toggleMediaModal: function( action ) {
		this.setState( {
			isSelecting: ( 'show' === action )
		} );
	},

	setImage: function( items ) {
		this.toggleMediaModal( 'hide' );

		if ( ! items || ! items.length ) {
			return;
		}

		PostActions.edit( {
			featured_image: items[0].ID
		} );

		stats.recordStat( 'featured_image_set' );
		stats.recordEvent( 'Featured image set' );
	},

	removeImage: function() {
		PostActions.edit( {
			featured_image: null
		} );

		stats.recordStat( 'featured_image_removed' );
		stats.recordEvent( 'Featured image removed' );
	},

	renderMediaModal: function() {
		if ( ! this.props.site ) {
			return;
		}

		return (
			<MediaLibrarySelectedData siteId={ this.props.site.ID }>
				<EditorMediaModal
					visible={ this.state.isSelecting }
					onClose={ this.setImage }
					site={ this.props.site }
					labels={ { confirm: this.translate( 'Set Featured Image' ) } }
					enabledFilters={ [ 'images' ] }
					single />
			</MediaLibrarySelectedData>
		);
	},

	renderCurrentImage: function() {
		var itemId;

		if ( ! this.props.site || ! this.props.post ) {
			return;
		}

		itemId = PostUtils.getFeaturedImageId( this.props.post );
		if ( ! itemId ) {
			return;
		}

		return (
			<EditorFeaturedImagePreviewContainer
				siteId={ this.props.site.ID }
				itemId={ itemId }
				maxWidth={ this.props.maxWidth } />
		);
	},

	render: function() {
		if ( this.props.editable ) {
			return (
				<AccordionSection className="editor-featured-image">
					{ this.renderMediaModal() }
					<EditorDrawerWell
						icon="image"
						label={ this.translate( 'Set Featured Image' ) }
						onClick={ () => this.toggleMediaModal( 'show' ) }
						onRemove={ this.removeImage }>
						{ this.renderCurrentImage() }
					</EditorDrawerWell>
				</AccordionSection>
			);
		}

		return (
			<div className="editor-featured-image">
				{ this.renderCurrentImage() }
			</div>
		);
	}
} );

module.exports = EditorFeaturedImage;
