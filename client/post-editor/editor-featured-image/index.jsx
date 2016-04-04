/**
 * External dependencies
 */
const React = require( 'react' ),
	classnames = require( 'classnames' );
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
/**
 * Internal dependencies
 */
const MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' ),
	EditorMediaModal = require( 'post-editor/media-modal' ),
	PostActions = require( 'lib/posts/actions' ),
	PostUtils = require( 'lib/posts/utils' ),
	stats = require( 'lib/posts/stats' ),
	EditorFeaturedImagePreviewContainer = require( './preview-container' );
import Button from 'components/button';
import {
	setFeaturedImage,
	removeFeaturedImage
} from 'state/ui/editor/post/actions';

const EditorFeaturedImage = React.createClass( {

	propTypes: {
		maxWidth: React.PropTypes.number,
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		setFeaturedImage: React.PropTypes.func,
		removeFeaturedImage: React.PropTypes.func,
		selecting: React.PropTypes.bool,
		onImageSelected: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			maxWidth: 450,
			setFeaturedImage: () => {},
			removeFeaturedImage: () => {},
			onImageSelected: () => {}
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
		this.props.onImageSelected();

		if ( ! items || ! items.length ) {
			return;
		}

		this.props.setFeaturedImage( items[0].ID );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			featured_image: items[0].ID
		} );

		stats.recordStat( 'featured_image_set' );
		stats.recordEvent( 'Featured image set' );
	},

	renderMediaModal: function() {
		if ( ! this.props.site ) {
			return;
		}

		return (
			<MediaLibrarySelectedData siteId={ this.props.site.ID }>
				<EditorMediaModal
					visible={ this.props.selecting || this.state.isSelecting }
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
		const classes = classnames( 'editor-featured-image', {
			'is-assigned': !! PostUtils.getFeaturedImageId( this.props.post )
		} );

		return (
			<Button
				onClick={ () => this.toggleMediaModal( 'show' ) }
				borderless
				className={ classes }>
				{ this.renderMediaModal() }
				{ this.renderCurrentImage() }
			</Button>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { setFeaturedImage, removeFeaturedImage }, dispatch ),
	null,
	{ pure: false }
)( EditorFeaturedImage );
