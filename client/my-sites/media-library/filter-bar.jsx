import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PlanStorage from 'calypso/blocks/plan-storage';
import Search from 'calypso/components/search';
import SectionNav from 'calypso/components/section-nav';
import SectionNavTabItem from 'calypso/components/section-nav/item';
import SectionNavTabs from 'calypso/components/section-nav/tabs';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import DataSource from './data-source';

// These source supply very large images, and there are instances such as
// the site icon editor, where we want to disable them because the editor
// can't handle the large images.
const largeImageSources = [ 'google_photos_picker', 'openverse', 'pexels' ];

const noop = () => {};

export class MediaLibraryFilterBar extends Component {
	static propTypes = {
		basePath: PropTypes.string,
		enabledFilters: PropTypes.arrayOf( PropTypes.string ),
		filter: PropTypes.string,
		filterRequiresUpgrade: PropTypes.bool,
		search: PropTypes.string,
		source: PropTypes.string,
		site: PropTypes.object,
		onFilterChange: PropTypes.func,
		onSearch: PropTypes.func,
		translate: PropTypes.func,
		post: PropTypes.bool,
		isConnected: PropTypes.bool,
		disableLargeImageSources: PropTypes.bool,
		disabledDataSources: PropTypes.arrayOf( PropTypes.string ),
	};

	static defaultProps = {
		filter: '',
		basePath: '/media',
		onFilterChange: noop,
		onSourceChange: noop,
		onSearch: noop,
		source: '',
		post: false,
		isConnected: true,
		disableLargeImageSources: false,
		disabledDataSources: [],
	};

	getSearchPlaceholderText() {
		const { filter, source, translate } = this.props;

		if ( 'pexels' === source ) {
			return translate( 'Search for free photos…' );
		}

		switch ( filter ) {
			case 'this-post':
				return translate( 'Search media uploaded to this post…' );
			case 'images':
				return translate( 'Search images…' );
			case 'audio':
				return translate( 'Search audio files…' );
			case 'videos':
				return translate( 'Search videos…' );
			case 'documents':
				return translate( 'Search documents…' );
			default:
				return translate( 'Search all media…' );
		}
	}

	getFilterLabel( filter ) {
		const { translate } = this.props;

		switch ( filter ) {
			case 'this-post':
				return translate( 'This Post', { comment: 'Filter label for media list' } );
			case 'images':
				return translate( 'Images', { comment: 'Filter label for media list' } );
			case 'audio':
				return translate( 'Audio', { comment: 'Filter label for media list' } );
			case 'videos':
				return translate( 'Videos', { comment: 'Filter label for media list' } );
			case 'documents':
				return translate( 'Documents', { comment: 'Filter label for media list' } );
			default:
				return translate( 'All', { comment: 'Filter label for media list' } );
		}
	}

	isFilterDisabled( filter ) {
		const { enabledFilters } = this.props;
		return enabledFilters && ( ! filter.length || ! includes( enabledFilters, filter ) );
	}

	changeFilter = ( filter ) => () => {
		this.props.onFilterChange( filter );
	};

	getFiltersForSource( source ) {
		if ( source === 'pexels' || source === 'openverse' ) {
			return [];
		}

		if ( source === 'google_photos_picker' ) {
			return [ '', 'images', 'videos' ];
		}

		return [ '', 'this-post', 'images', 'documents', 'videos', 'audio' ];
	}

	renderTabItems() {
		let tabs = this.getFiltersForSource( this.props.source );

		if ( ! this.props.post ) {
			tabs = tabs.filter( ( tab ) => tab !== 'this-post' );
		}

		if ( tabs.length === 0 ) {
			return null;
		}

		return (
			<SectionNavTabs>
				{ tabs.map( ( filter ) => (
					<SectionNavTabItem
						key={ 'filter-tab-' + filter }
						selected={ this.props.filter === filter }
						onClick={ this.changeFilter( filter ) }
						disabled={ this.isFilterDisabled( filter ) }
					>
						{ this.getFilterLabel( filter ) }
					</SectionNavTabItem>
				) ) }
			</SectionNavTabs>
		);
	}

	renderSearchSection() {
		const { source, onSearch, search, filterRequiresUpgrade, isConnected } = this.props;

		if ( filterRequiresUpgrade || ! isConnected ) {
			return null;
		}

		if ( source === 'google_photos_picker' ) {
			return null;
		}

		const isPinned = source === '';

		// Set the 'key' value so if the source is changed the component is refreshed, forcing it to clear the existing state
		return (
			<Search
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={ source === 'pexels' || source === 'openverse' }
				key={ source }
				analyticsGroup="Media"
				pinned={ isPinned }
				fitsContainer
				onSearch={ onSearch }
				initialValue={ search }
				placeholder={ this.getSearchPlaceholderText() }
				delaySearch
			/>
		);
	}

	renderPlanStorage() {
		//hide the plan storage when viewing external sources
		if ( this.props.source ) {
			return null;
		}

		const eventName = 'calypso_upgrade_nudge_impression';
		const eventProperties = { cta_name: 'plan-media-storage' };
		return (
			<PlanStorage siteId={ this.props.site.ID }>
				<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
			</PlanStorage>
		);
	}

	render() {
		const disabledSources = this.props.disableLargeImageSources
			? [ ...new Set( [].concat( this.props.disabledDataSources, largeImageSources ) ) ]
			: this.props.disabledDataSources;

		// Dropdown is disabled when viewing any external data source
		return (
			<div className="media-library__filter-bar">
				<DataSource
					source={ this.props.source }
					onSourceChange={ this.props.onSourceChange }
					disabledSources={ disabledSources }
				/>

				<SectionNav
					selectedText={ this.getFilterLabel( this.props.filter ) }
					hasSearch
					allowDropdown={ ! this.props.source }
				>
					{ this.renderTabItems() }
					{ this.renderSearchSection() }
				</SectionNav>

				{ this.renderPlanStorage() }
			</div>
		);
	}
}

export default localize( MediaLibraryFilterBar );
