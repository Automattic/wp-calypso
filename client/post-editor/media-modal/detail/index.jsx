/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/noop' );
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var DetailItem = require( './detail-item' ),
	MediaUtils = require( 'lib/media/utils' ),
	HeaderCake = require( 'components/header-cake' ),
	EditorMediaModalDetailTitle = require( './detail-title' ),
	preloadImage = require( '../preload-image' );
import { ModalViews } from 'state/ui/media-modal/constants';
import { setEditorMediaModalView } from 'state/ui/editor/actions';

const EditorMediaModalDetail = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		items: React.PropTypes.array,
		setView: React.PropTypes.func,
		selectedIndex: React.PropTypes.number,
		onSelectedIndexChange: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			selectedIndex: 0,
			onSelectedIndexChange: noop
		};
	},

	componentDidMount: function() {
		this.preloadImages();
	},

	componentDidUpdate: function() {
		this.preloadImages();
	},

	preloadImages: function() {
		MediaUtils.filterItemsByMimePrefix( this.props.items, 'image' ).forEach( function( image ) {
			var src = MediaUtils.url( image, {
				photon: this.props.site && ! this.props.site.is_private
			} );

			preloadImage( src );
		}, this );
	},

	returnToList: function() {
		this.props.setView( ModalViews.LIST );
	},

	incrementIndex: function( increment ) {
		this.props.onSelectedIndexChange( this.props.selectedIndex + increment );
	},

	editItem() {
		this.props.setView( ModalViews.IMAGE_EDITOR );
	},

	render: function() {
		const { items } = this.props;

		return (
			<div className="editor-media-modal-detail">
				<HeaderCake onClick={ this.returnToList } backText={ this.translate( 'Media Library' ) }>
					<EditorMediaModalDetailTitle
						site={ this.props.site }
						item={ items[ this.props.selectedIndex ] } />
				</HeaderCake>
				<DetailItem
					site={ this.props.site }
					item={ items[ this.props.selectedIndex ] }
					hasPreviousItem={ this.props.selectedIndex - 1 >= 0 }
					hasNextItem={ this.props.selectedIndex + 1 < items.length }
					onShowPreviousItem={ this.incrementIndex.bind( this, -1 ) }
					onShowNextItem={ this.incrementIndex.bind( this, 1 ) }
					onEdit={ this.editItem } />
			</div>
		);
	}
} );

export default connect( null, {
	setView: setEditorMediaModalView
} )( EditorMediaModalDetail );
