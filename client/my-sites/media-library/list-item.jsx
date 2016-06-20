/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/noop' ),
	assign = require( 'lodash/assign' ),
	omit = require( 'lodash/omit' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * External dependencies
 */
var Spinner = require( 'components/spinner' ),
	Gridicon = require( 'components/gridicon' ),
	Button = require( 'components/button' ),
	ListItemImage = require( './list-item-image' ),
	ListItemVideo = require( './list-item-video' ),
	ListItemAudio = require( './list-item-audio' ),
	ListItemDocument = require( './list-item-document' ),
	MediaUtils = require( 'lib/media/utils' );

import EditorMediaModalGalleryHelp from 'post-editor/media-modal/gallery-help';

export default React.createClass( {
	displayName: 'MediaLibraryListItem',

	propTypes: {
		media: React.PropTypes.object,
		scale: React.PropTypes.number.isRequired,
		maxImageWidth: React.PropTypes.number,
		photon: React.PropTypes.bool,
		showGalleryHelp: React.PropTypes.bool,
		selectedIndex: React.PropTypes.number,
		onToggle: React.PropTypes.func,
		onEditItem: React.PropTypes.func,
		style: React.PropTypes.object,
	},

	getDefaultProps: function() {
		return {
			maxImageWidth: 450,
			photon: true,
			selectedIndex: -1,
			onToggle: noop,
			onEditItem: noop
		};
	},

	shouldComponentUpdate: function( nextProps ) {
		return ! ( nextProps.media === this.props.media &&
			nextProps.scale === this.props.scale &&
			nextProps.maxImageWidth === this.props.maxImageWidth &&
			nextProps.photon === this.props.photon &&
			nextProps.selectedIndex === this.props.selectedIndex &&
			isEqual( nextProps.style, this.props.style ) );
	},

	clickItem: function( event ) {
		this.props.onToggle( this.props.media, event.shiftKey );
	},

	editItem: function( event ) {
		this.props.onEditItem( this.props.media );

		// Prevent default list item toggle behavior
		event.stopPropagation();
	},

	renderItem: function() {
		var component;

		if ( ! this.props.media ) {
			return;
		}

		switch ( MediaUtils.getMimePrefix( this.props.media ) ) {
			case 'image': component = ListItemImage; break;
			case 'video': component = ListItemVideo; break;
			case 'audio': component = ListItemAudio; break;
			default: component = ListItemDocument; break;
		}

		return React.createElement( component, this.props );
	},

	renderSpinner: function() {
		if ( ! this.props.media || ! this.props.media.transient ) {
			return;
		}

		return <Spinner className="media-library__list-item-spinner" />;
	},

	render: function() {
		var classes, props, style, title;

		classes = classNames( 'media-library__list-item', {
			'is-placeholder': ! this.props.media,
			'is-selected': -1 !== this.props.selectedIndex,
			'is-transient': this.props.media && this.props.media.transient,
			'is-small': this.props.scale <= 0.125
		} );

		props = omit( this.props, Object.keys( this.constructor.propTypes ) );

		style = assign( {
			width: ( this.props.scale * 100 ) + '%'
		}, this.props.style );

		if ( this.props.media ) {
			title = this.props.media.file;
		}

		if ( -1 !== this.props.selectedIndex ) {
			props[ 'data-selected-number' ] = this.props.selectedIndex + 1;
		}

		return (
			<div className={ classes } style={ style } onClick={ this.clickItem } { ...props }>
				<span className="media-library__list-item-selected-icon">
					<Gridicon icon="checkmark" size={ 20 } />
				</span>
				<figure className="media-library__list-item-figure" title={ title }>
					{ this.renderItem() }
					{ this.renderSpinner() }
					{ this.props.showGalleryHelp && <EditorMediaModalGalleryHelp /> }
					<Button type="button" className="media-library__list-item-edit" onClick={ this.editItem }>
						<span className="screen-reader-text">
							{ this.translate( 'Edit', { context: 'verb' } ) }
						</span>
						<Gridicon icon="pencil" />
					</Button>
				</figure>
			</div>
		);
	}
} );

