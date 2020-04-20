import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

import Filters from './filters';
import getFilterName from '../state/selectors/get-filter-name';

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
		const { filterName } = this.props;

		const filterItems = Object.keys( Filters )
			.map( ( name ) => Filters[ name ]() )
			.sort( ( a, b ) => a.index - b.index );

		return (
			<div className="wpnc__filter">
				<ul className="wpnc__filter__segmented-control">
					{ filterItems.map( ( { label, name } ) => (
						<li
							key={ name }
							data-filter-name={ name }
							className={ classNames( 'wpnc__filter__segmented-control-item', {
								selected: name === filterName,
							} ) }
							onClick={ this.selectFilter }
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
