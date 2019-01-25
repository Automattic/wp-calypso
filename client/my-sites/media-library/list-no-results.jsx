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
		let searchOrQueryFilter;

		const hasSearchOrFiltersText = this.props.translate( 'the search and/or filters you applied', {
			context: 'Media no results due to search term or applied filters',
		} );

		const hasSearchTermText = this.props.translate( 'your search for "%s"', {
			args: this.props.search,
			context: 'Media no results due to search term',
		} );

		const hasQueryFilterText = this.props.translate( 'the filters you applied', {
			context: 'Media no results due to applied filters',
		} );

		if ( this.props.search && this.hasActiveQueryFilters() ) {
			searchOrQueryFilter = hasSearchOrFiltersText;
		} else if ( this.props.search ) {
			searchOrQueryFilter = hasSearchTermText;
		} else {
			searchOrQueryFilter = hasQueryFilterText;
		}

		switch ( this.props.filter ) {
			case 'images':
				label = this.props.translate( 'No images match %s.', {
					args: searchOrQueryFilter,
					context: 'Media no search or filter results',
				} );
				break;
			case 'videos':
				label = this.props.translate( 'No videos match %s.', {
					args: searchOrQueryFilter,
					context: 'Media no search or filter results',
				} );
				break;
			case 'audio':
				label = this.props.translate( 'No audio files match %s.', {
					args: searchOrQueryFilter,
					context: 'Media no search or filter results',
				} );
				break;
			case 'documents':
				label = this.props.translate( 'No documents match %s.', {
					args: searchOrQueryFilter,
					context: 'Media no search or filter results',
				} );
				break;
			default:
				label = this.props.translate( 'No media files match %s.', {
					args: searchOrQueryFilter,
					context: 'Media no search or filter results',
				} );
				break;
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
