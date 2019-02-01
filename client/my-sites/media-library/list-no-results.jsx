/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import NoResults from 'my-sites/no-results';

class MediaLibraryListNoResults extends React.Component {
	static displayName = 'MediaLibraryListNoResults';

	static propTypes = {
		filter: PropTypes.string,
		search: PropTypes.string,
		queryFilters: PropTypes.object,
	};

	static defaultProps = {
		search: '',
		queryFilters: null,
	};

	hasActiveQueryFilters() {
		return this.props.queryFilters && ! isEmpty( this.props.queryFilters.dateRange );
	}

	getLabel = () => {
		let label;

		const hasSearchOrFiltersText = this.props.translate(
			'No results match the search term and/or filters you applied',
			{
				context: 'Media no results due to search term or applied filters',
			}
		);

		const hasSearchTermText = this.props.translate( 'No results match your search for "%s"', {
			args: this.props.search,
			context: 'Media no results due to search term',
		} );

		const hasQueryFilterText = this.props.translate( 'No results match the filters you applied', {
			context: 'Media no results due to applied filters',
		} );

		if ( this.props.search && this.hasActiveQueryFilters() ) {
			label = hasSearchOrFiltersText;
		} else if ( this.props.search ) {
			label = hasSearchTermText;
		} else {
			label = hasQueryFilterText;
		}

		return label;
	};

	render() {
		return (
			<NoResults text={ this.getLabel() } image="/calypso/images/pages/illustration-pages.svg" />
		);
	}
}

export default localize( MediaLibraryListNoResults );
