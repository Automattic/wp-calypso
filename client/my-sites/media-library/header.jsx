/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import _debug from 'debug';
const debug = _debug( 'calypso:media-library:header' );

/**
 * Internal dependencies
 */
import { isMobile } from 'lib/viewport';
import Button from 'components/button';
import FormRange from 'components/forms/range';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import UploadButton from './upload-button';
import MediaLibraryUploadUrl from './upload-url';
import { userCan } from 'lib/site/utils';
import config from 'config';

export default React.createClass( {
	displayName: 'MediaLibraryHeader',

	propTypes: {
		site: PropTypes.object,
		filter: PropTypes.string,
		scale: PropTypes.number,
		onMediaScaleChange: PropTypes.func,
		mediaScaleChoices: PropTypes.arrayOf( PropTypes.number ).isRequired,
		mediaScale: PropTypes.number.isRequired,
		sliderPositionCount: PropTypes.number,
		onAddMedia: PropTypes.func
	},

	statics: {
		SCALE_TOUCH_GRID: 0.32
	},

	getInitialState() {
		return {
			addingViaUrl: false,
			isMoreOptionsVisible: false
		};
	},

	getDefaultProps() {
		return {
			onAddMedia: () => {},
			onMediaScaleChange: () => {},
			sliderPositionCount: 100
		};
	},

	setMoreOptionsContext( component ) {
		if ( ! component ) {
			return;
		}

		this.setState( {
			moreOptionsContext: component
		} );
	},

	onMediaScaleChange( event ) {
		const sliderPosition = parseInt( event.target.value ),
			scaleIndex = sliderPosition * this.props.mediaScaleChoices.length / this.props.sliderPositionCount,
			scale = this.props.mediaScaleChoices[ Math.floor( scaleIndex ) ];

		debug(
			'onMediaScaleChange sliderPosition=%d scaleIndex=%d scale=%f',
			sliderPosition, scaleIndex, scale
		);

		this.props.onMediaScaleChange( scale );
		this.setState( { sliderPosition } );
	},

	getMediaScaleSliderPosition() {
		// As part of the smooth motion of the slider, the user can move it
		// between two snap points, and we want to remember this.

		if ( typeof this.state.sliderPosition !== 'undefined' ) {
			return this.state.sliderPosition;
		}

		const scale = this.props.mediaScale,
			scaleIndex = this.props.mediaScaleChoices.indexOf( scale );

		// Map the media scale index back to a slider position as follows:
		// index 0 -> position 0
		// index this.props.mediaScaleChoices.length - 1 -> position this.props.sliderPositionCount - 1

		if ( scaleIndex < 0 ) {
			debug( 'getMediaScaleSliderPosition unrecognized scale %f', scale );
			return 0;
		}

		const { sliderPositionCount, mediaScaleChoices } = this.props,
			sliderPosition = Math.floor( scaleIndex * ( sliderPositionCount - 1 ) / ( mediaScaleChoices.length - 1 ) );

		debug(
			'getMediaScaleSliderPosition scale=%f scaleIndex=%d sliderPosition=%d',
			scale, scaleIndex, sliderPosition
		);
		return sliderPosition;
	},

	toggleAddViaUrl( state ) {
		this.setState( {
			addingViaUrl: state,
			isMoreOptionsVisible: false
		} );
	},

	toggleMoreOptions( state ) {
		this.setState( {
			isMoreOptionsVisible: state
		} );
	},

	renderUploadAndEditButton() {
		if ( ! config.isEnabled( 'post-editor/image-editor' ) ) {
			return;
		}

		return (
			<Button
				className="is-desktop"
				onClick={ this.props.onAddAndEditImage } >
				<Gridicon icon="pencil" />
				{ this.translate( 'Add and edit image' ) }
			</Button>
		);
	},

	renderUploadButtons() {
		const { site, filter, onAddMedia } = this.props;

		if ( ! userCan( 'upload_files', site ) ) {
			return;
		}

		return (
			<div className="media-library__upload-buttons">
				<UploadButton
					site={ site }
					filter={ filter }
					onAddMedia={ onAddMedia }
					className="button is-primary">
					{ this.translate( 'Add New', { context: 'Media upload' } ) }
				</UploadButton>
				<button
					onClick={ this.toggleAddViaUrl.bind( this, true ) }
					className="button is-desktop">
					{ this.translate( 'Add via URL', { context: 'Media upload' } ) }
				</button>
				{ this.renderUploadAndEditButton() }
				<button
					ref={ this.setMoreOptionsContext }
					onClick={ this.toggleMoreOptions.bind( this, ! this.state.isMoreOptionsVisible ) }
					className="button is-primary is-mobile">
					<span className="screen-reader-text">
						{ this.translate( 'More Options' ) }
					</span>
					<Gridicon icon="chevron-down" size={ 20 }/>
					<PopoverMenu
						context={ this.state.moreOptionsContext }
						isVisible={ this.state.isMoreOptionsVisible }
						onClose={ this.toggleMoreOptions.bind( this, false ) }
						position="bottom right"
						className="popover is-dialog-visible">
						<PopoverMenuItem onClick={ this.toggleAddViaUrl.bind( this, true ) }>
							{ this.translate( 'Add via URL', { context: 'Media upload' } ) }
						</PopoverMenuItem>
					</PopoverMenu>
				</button>
			</div>
		);
	},

	renderScaleToggle() {
		const { mediaScale, sliderPositionCount, onMediaScaleChange } = this.props;

		if ( isMobile() ) {
			return (
				<SegmentedControl className="media-library__scale-toggle" compact>
					<SegmentedControlItem
						selected={ 1 !== mediaScale }
						onClick={ () => onMediaScaleChange( this.constructor.SCALE_TOUCH_GRID ) }>
						<span className="screen-reader-text">
							{ this.translate( 'Grid' ) }
						</span>
						<Gridicon icon="grid" />
					</SegmentedControlItem>
					<SegmentedControlItem
						selected={ 1 === mediaScale }
						onClick={ () => onMediaScaleChange( 1 ) }>
						<span className="screen-reader-text">
							{ this.translate( 'List' ) }
						</span>
						<Gridicon icon="menu" />
					</SegmentedControlItem>
				</SegmentedControl>
			);
		}

		return (
			<FormRange
				step="1"
				min="0"
				max={ sliderPositionCount - 1 }
				minContent={ <Gridicon icon="image" size={ 16 } /> }
				maxContent={ <Gridicon icon="image" size={ 24 }/> }
				value={ this.getMediaScaleSliderPosition() }
				onChange={ this.onMediaScaleChange }
				className="media-library__scale-range" />
		);
	},

	render() {
		const { site, onAddMedia } = this.props;

		if ( this.state.addingViaUrl ) {
			return (
				<MediaLibraryUploadUrl
					site={ site }
					onAddMedia={ onAddMedia }
					onClose={ this.toggleAddViaUrl.bind( this, false ) }
					className="media-library__header" />
			);
		}

		return (
			<header className="media-library__header">
				<h2 className="media-library__heading">{ this.translate( 'Media Library' ) }</h2>
				{ this.renderUploadButtons() }
				{ this.renderScaleToggle() }
			</header>
		);
	}
} );
