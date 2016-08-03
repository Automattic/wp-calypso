/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { trim } from 'lodash';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import Stream from 'reader/stream';
import EmptyContent from './empty';
import BlankContent from './blank';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import SearchCard from 'components/post-card/search';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import { recordTrackForPost } from 'reader/stats';
import sampleSize from 'lodash/sampleSize';
import i18nUtils from 'lib/i18n-utils';

const SearchCardAdapter = React.createClass( {
	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		return {
			site: SiteStore.get( props.post.site_ID ),
			feed: props.post.feed_ID ? FeedStore.get( props.post.feed_ID ) : null
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateFromStores( nextProps ) );
	},

	onCardClick( props, event ) {
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		const rootNode = ReactDom.findDOMNode( this );
		const anchor = closest( event.target, 'a', true, rootNode );

		if ( anchor && anchor.href.search( /\/read\/blogs\/|\/read\/feeds\// ) !== -1 ) {
			return;
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel=external]', true, rootNode ) ) {
			return;
		}

		recordTrackForPost( 'calypso_reader_searchcard_clicked', this.props.post );

		event.preventDefault();
		this.props.handleClick( this.props.post, {} );
	},

	onCommentClick() {
		this.props.handleClick( this.props.post, { comments: true } );
	},

	render() {
		return <SearchCard
			post={ this.props.post }
			site={ this.state.site }
			feed={ this.state.feed }
			onClick={ this.onCardClick }
			onCommentClick={ this.onCommentClick }
			showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards } />;
	}
} );

const emptyStore = {
	get() {
		return [];
	},
	isLastPage() {
		return true;
	},
	getUpdateCount() {
		return 0;
	},
	getSelectedIndex() {
		return -1;
	},
	on() {},
	off() {}
};

const FeedStream = React.createClass( {

	searchSuggestions: {
		en: [
			'2016 Election',
			'Astrology',
			'Batman',
			'Beach',
			'Beautiful',
			'Bloom',
			'Chickens',
			'Clinton',
			'Cocktails',
			'Colorado',
			'Craft Beer',
			'Cute',
			'DIY',
			'Delicious',
			'Dogs',
			'Elasticsearch',
			'Fabulous',
			'Farm',
			'Flowers',
			'Funny',
			'Garden',
			'Groovy',
			'Happy Place',
			'Hiking',
			'Homesteading',
			'Iceland',
			'Inspiration',
			'Juno',
			'Mathematics',
			'Michigan',
			'Monkeys',
			'Mountain Biking',
			'Obama',
			'Overwatch',
			'Pokemon GO',
			'Pride',
			'Recipe',
			'Red Sox',
			'Robots',
			'Scenic',
			'Sharks',
			'Sous vide',
			'Sunday Brunch',
			'Tibet',
			'Toddlers',
			'Travel Backpacks',
			'Travel',
			'Trump',
			'Woodworking',
			'WordPress',
			'Zombies'
		]
	},

	propTypes: {
		query: React.PropTypes.string
	},

	getInitialState() {
		let suggestions = null;
		const lang = i18nUtils.getLocaleSlug();
		if ( this.searchSuggestions[ lang ] ) {
			suggestions = sampleSize( this.searchSuggestions[ lang ], 3 );
		}
		return {
			suggestions: suggestions,
			title: this.getTitle()
		};
	},

	getDefaultProps() {
		return {
			showBlankContent: true
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	},

	updateState( props = this.props ) {
		const newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	},

	getTitle( props = this.props ) {
		return props.query;
	},

	updateQuery( newValue ) {
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if ( trimmedValue === '' || trimmedValue.length > 1 && trimmedValue !== this.props.query ) {
			this.props.onQueryChange( newValue );
		}
	},

	cardFactory() {
		return SearchCardAdapter;
	},

	render() {
		const emptyContent = this.props.query
			? <EmptyContent query={ this.props.query } />
			: this.props.showBlankContent && <BlankContent suggestions={ this.state.suggestions }/>;

		// Override showing of EmptyContent in Reader stream
		let showEmptyContent = true;
		if ( this.props.showBlankContent === false || this.props.query ) {
			showEmptyContent = false;
		}

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title || this.translate( 'Search' ) );
		}

		const store = this.props.store || emptyStore;

		let searchPlaceholderText = this.props.searchPlaceholderText;
		if ( ! searchPlaceholderText ) {
			searchPlaceholderText = this.translate( 'Search billions of WordPress.com posts…' );
		}

		return (
			<Stream { ...this.props } store={ store }
				listName={ this.translate( 'Search' ) }
				emptyContent={ emptyContent }
				showEmptyContent={ showEmptyContent }
				showFollowInHeader={ true }
				cardFactory={ this.cardFactory }
				className="search-stream" >
				{ this.props.showBack && <HeaderBack /> }
				<CompactCard className="search-stream__input-card">
					<SearchInput
						initialValue={ this.props.query }
						onSearch={ this.updateQuery }
						autoFocus={ true }
						delaySearch={ true }
						delayTimeout={ 500 }
						placeholder={ searchPlaceholderText } />
				</CompactCard>
			</Stream>
		);
	}
} );

export default FeedStream;
