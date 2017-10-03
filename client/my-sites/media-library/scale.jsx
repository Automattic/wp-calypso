/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, partial } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormRange from 'components/forms/range';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import { setPreference, savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

/**
 * Constants
 */

/**
 * Scale choices are 12, 8, 6, 4, and 3 items per row, with some horizontal
 * padding between items
 *
 * @type {Array}
 */
const SCALE_CHOICES = [ 0.077, 0.115, 0.157, 0.24, 0.323 ];

/**
 * Number of steps on the rendered input range
 *
 * @type {Number}
 */
const SLIDER_STEPS = 100;

/**
 * Scale size for small viewports grid option (3 items per row).
 *
 * @type {Number}
 */
const SCALE_TOUCH_GRID = 0.32;

class MediaLibraryScale extends Component {
	static propTypes = {
		mediaScale: PropTypes.number,
		onChange: PropTypes.func,
		setMediaScalePreference: PropTypes.func,
		saveMediaScalePreference: PropTypes.func
	};

	static defaultProps = {
		onChange: () => {}
	};

	constructor() {
		super( ...arguments );

		this.onScaleChange = this.onScaleChange.bind( this );
		this.savePreference = this.savePreference.bind( this );
		this.debouncedSavePreference = debounce( this.savePreference, 1000 );
		this.setScaleToMobileGrid = this.setScale.bind( this, SCALE_TOUCH_GRID );
		this.setScaleToMobileFull = this.setScale.bind( this, 1 );

		this.state = {};
	}

	componentWillUnmount() {
		this.debouncedSavePreference.cancel();
	}

	savePreference( value ) {
		this.props.saveMediaScalePreference( value );
	}

	setScale( value ) {
		if ( value === this.props.scale ) {
			return;
		}

		this.props.onChange( value );
		this.props.setMediaScalePreference( value );
		this.debouncedSavePreference( value );
	}

	onScaleChange( event ) {
		const sliderPosition = parseInt( event.target.value, 10 );
		const scaleIndex = sliderPosition * SCALE_CHOICES.length / SLIDER_STEPS;
		const scale = SCALE_CHOICES[ Math.floor( scaleIndex ) ];

		this.setState( { sliderPosition } );
		this.setScale( scale );
	}

	getSliderPosition() {
		// As part of the smooth motion of the slider, the user can move it
		// between two snap points, and we want to remember this.
		if ( this.state.hasOwnProperty( 'sliderPosition' ) ) {
			return this.state.sliderPosition;
		}

		const { scale } = this.props;

		// Map the media scale index back to a slider position as follows:
		// index 0 -> position 0
		// index SCALE_CHOICES.length - 1 -> position SLIDER_STEPS - 1
		const scaleIndex = SCALE_CHOICES.indexOf( scale );
		if ( -1 === scaleIndex ) {
			return 0;
		}

		return Math.floor( scaleIndex * ( SLIDER_STEPS - 1 ) / ( SCALE_CHOICES.length - 1 ) );
	}

	render() {
		const { translate, scale } = this.props;

		return (
			<div className="media-library__scale">
				<SegmentedControl className="media-library__scale-toggle" compact>
					<SegmentedControlItem
						selected={ 1 !== scale }
						onClick={ this.setScaleToMobileGrid }>
						<span className="media-library__scale-toggle-label">
							{ translate( 'Grid' ) }
						</span>
						<Gridicon icon="grid" size={ 18 } />
					</SegmentedControlItem>
					<SegmentedControlItem
						selected={ 1 === scale }
						onClick={ this.setScaleToMobileFull }>
						<span className="media-library__scale-toggle-label">
							{ translate( 'List' ) }
						</span>
						<Gridicon icon="menu" size={ 18 } />
					</SegmentedControlItem>
				</SegmentedControl>
				<FormRange
					step="1"
					min="0"
					max={ SLIDER_STEPS - 1 }
					minContent={ <Gridicon icon="image" size={ 12 } /> }
					maxContent={ <Gridicon icon="image" size={ 24 } /> }
					value={ this.getSliderPosition() }
					onChange={ this.onScaleChange }
					className="media-library__scale-range" />
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		scale: getPreference( state, 'mediaScale' )
	} ),
	{
		setMediaScalePreference: partial( setPreference, 'mediaScale' ),
		saveMediaScalePreference: partial( savePreference, 'mediaScale' )
	}
)( localize( MediaLibraryScale ) );
