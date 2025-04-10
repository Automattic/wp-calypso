import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import getFilterName from '../state/selectors/get-filter-name';
import Filters from './filters';

export class FilterBar extends Component {
	filterListRef = createRef();

	timerId = null;

	componentDidMount() {
		if ( this.props.isPanelOpen ) {
			this.focusOnSelectedTab();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.isPanelOpen && this.props.isPanelOpen ) {
			this.focusOnSelectedTab();
		}

		// Reset the filter items when i18n data changes, to ensure the translatable fields are properly updated.
		if ( prevProps.translate !== this.props.translate ) {
			this.setFilterItems();
		}
	}

	componentWillUnmount() {
		if ( this.timerId ) {
			window.clearTimeout( this.timerId );
		}
	}

	setFilterItems = () => {
		this.filterItems = Object.values( Filters ).sort( ( a, b ) => a.index - b.index );
	};

	getFilterItems = () => {
		if ( ! this.filterItems ) {
			this.setFilterItems();
		}

		return this.filterItems;
	};

	focusOnSelectedTab() {
		if ( ! this.props.autoFocus ) {
			return;
		}

		const selectedFilter = this.filterListRef.current?.querySelector(
			'.components-toggle-group-control-option-base[aria-checked="true"]'
		);
		if ( selectedFilter ) {
			// It might be focused immediately when the panel is opening because of the pointer-events is none.
			this.timerId = window.setTimeout( () => selectedFilter.focus(), 300 );
		}
	}

	handleKeydown = ( event ) => {
		let direction;
		if ( event.key === 'ArrowRight' ) {
			direction = 1;
		} else if ( event.key === 'ArrowLeft' ) {
			direction = -1;
		}

		if ( ! direction ) {
			return;
		}
		event.stopPropagation();
		const filterItems = this.getFilterItems();
		const currentIndex = filterItems.findIndex( ( { name } ) => name === this.props.filterName );
		const nextIndex = ( currentIndex + direction + filterItems.length ) % filterItems.length;
		this.props.controller.selectFilter( filterItems[ nextIndex ].name );
	};

	render() {
		const { filterName, translate } = this.props;
		const filterItems = this.getFilterItems();

		return (
			<div className="wpnc__filter" ref={ this.filterListRef }>
				<ToggleGroupControl
					hideLabelFromVision
					isBlock
					label={ translate( 'Filter Notifications' ) }
					value={ filterName }
					onChange={ ( selectedFilter ) => this.props.controller.selectFilter( selectedFilter ) }
					onKeyDown={ this.handleKeydown }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				>
					{ filterItems.map( ( { label, name } ) => {
						return (
							<ToggleGroupControlOption key={ name } label={ label( translate ) } value={ name } />
						);
					} ) }
				</ToggleGroupControl>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	filterName: getFilterName( state ),
} );

export default connect( mapStateToProps )( localize( FilterBar ) );
