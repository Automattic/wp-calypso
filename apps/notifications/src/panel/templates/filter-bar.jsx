import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import getFilterName from '../state/selectors/get-filter-name';
import Filters from './filters';

export class FilterBar extends Component {
	selectFilter = ( event ) => {
		if ( event ) {
			event.stopPropagation();
			event.preventDefault();
		}

		const filterName = event.target.dataset.filterName;
		this.props.controller.selectFilter( filterName );
	};

	render() {
		const { filterName, translate } = this.props;

		const filterItems = Object.keys( Filters )
			.map( ( name ) => Filters[ name ]() )
			.sort( ( a, b ) => a.index - b.index );

		return (
			<div className="wpnc__filter">
				<ul
					className="wpnc__filter--segmented-control"
					role="tablist"
					aria-label={ translate( 'Filter notifications' ) }
				>
					{ filterItems.map( ( { label, name } ) => (
						<li
							key={ name }
							data-filter-name={ name }
							className={ clsx( 'wpnc__filter--segmented-control-item', {
								selected: name === filterName,
							} ) }
							onClick={ this.selectFilter }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' ) {
									this.selectFilter( e );
								}
							} }
							role="tab"
							aria-selected={ name === filterName }
							aria-controls="wpnc__note-list"
							tabIndex={ 0 }
						>
							{ label }
						</li>
					) ) }
				</ul>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	filterName: getFilterName( state ),
} );

export default connect( mapStateToProps )( localize( FilterBar ) );
