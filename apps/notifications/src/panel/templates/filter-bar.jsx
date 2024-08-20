import clsx from 'clsx';
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
			'.wpnc__filter--segmented-control-item[aria-selected="true"]'
		);
		if ( selectedFilter ) {
			// It might be focused immediately when the panel is opening because of the pointer-events is none.
			this.timerId = window.setTimeout( () => selectedFilter.focus(), 300 );
		}
	}

	selectFilter = ( event ) => {
		if ( event ) {
			event.stopPropagation();
			event.preventDefault();
		}

		const filterName = event.target.dataset.filterName;
		this.props.controller.selectFilter( filterName );
	};

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
			<div className="wpnc__filter">
				<ul
					className="wpnc__filter--segmented-control"
					role="tablist"
					aria-label={ translate( 'Filter notifications' ) }
					ref={ this.filterListRef }
					onKeyDown={ this.handleKeydown }
				>
					{ filterItems.map( ( { label, name } ) => {
						const isSelected = name === filterName;
						return (
							<li
								key={ name }
								data-filter-name={ name }
								className={ clsx( 'wpnc__filter--segmented-control-item', {
									selected: isSelected,
								} ) }
								onClick={ this.selectFilter }
								onKeyDown={ ( e ) => {
									if ( e.key === 'Enter' ) {
										this.selectFilter( e );
									}
								} }
								role="tab"
								aria-selected={ isSelected }
								aria-controls="wpnc__note-list"
								tabIndex={ isSelected ? 0 : -1 }
							>
								{ label( translate ) }
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	filterName: getFilterName( state ),
} );

export default connect( mapStateToProps )( localize( FilterBar ) );
