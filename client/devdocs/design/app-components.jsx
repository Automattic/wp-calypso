/**
* External dependencies
*/
var React = require( 'react' ),
	page = require( 'page' ),
	toTitleCase = require( 'to-title-case' ),
	trim = require( 'lodash/trim' );

/**
 * Internal dependencies
 */
var SearchCard = require( 'components/search-card' ),
	CommentButtons = require( 'components/comment-button/docs/example' ),
	PostSelector = require( 'my-sites/post-selector/docs/example' ),
	LikeButtons = require( 'components/like-button/docs/example' ),
	FollowButtons = require( 'components/follow-button/docs/example' ),
	Sites = require( 'lib/sites-list/docs/example' ),
	SitesDropdown = require( 'components/sites-dropdown/docs/example' ),
	Theme = require( 'components/theme/docs/example' ),
	PostSchedule = require( 'components/post-schedule/docs/example' ),
	HeaderCake = require( 'components/header-cake' ),
	Collection,
	FilterSummary,
	Hider;

Hider = React.createClass( {
	displayName: 'Hider',

	propTypes: {
		hide: React.PropTypes.bool,
	},

	shouldComponentUpdate: function( nextProps ) {
		return this.props.hide !== nextProps.hide;
	},

	render: function() {
		return (
			<div style={ this.props.hide ? { display: 'none' } : { } }>
				{ this.props.children }
			</div>
		);
	}
} );

Collection = React.createClass( {
	displayName: 'Collection',

	shouldWeHide: function( example ) {
		var filter, searchString;

		filter = this.props.filter || '';
		searchString = example.type.displayName;

		if ( this.props.component ) {
			return example.type.displayName.toLowerCase() !== this.props.component.replace( /-([a-z])/g, '$1' );
		}

		if ( example.props.searchKeywords ) {
			searchString += ' ' + example.props.searchKeywords;
		}

		return ! ( ! filter || searchString.toLowerCase().indexOf( filter ) > -1 );
	},

	visibleExamples: function() {
		return this.props.children.filter( function( child ) {
			return !child.props.hide;
		} );
	},

	render: function() {
		var summary, examples;

		summary = !this.props.component ? <FilterSummary items={ this.visibleExamples() } total={ this.props.children.length } /> : null;

		examples = this.props.children.map( ( example ) => {
			return (
				<Hider hide={ this.shouldWeHide( example ) } key={ 'example-' + example.type.displayName }>
					{ example }
				</Hider>
			);
		} );

		return (
			<div className="collection">
				{ summary }
				{ examples }
			</div>
		);
	}
} );

FilterSummary = React.createClass( {
	render: function() {
		var names;

		if ( this.props.items.length === 0 ) {
			return ( <p>No matches found</p> );
		} else if ( this.props.items.length === this.props.total || this.props.items.length === 1 ) {
			return null;
		}

		names = this.props.items.map( function( item ) {
			return item.props.children.type.displayName;
		} );

		return (
			<p>Showing: { names.join( ', ' ) }</p>
		);
	}
} );

module.exports = React.createClass( {
	displayName: 'AppComponents',

	getInitialState: function() {
		return { filter: '' };
	},

	onSearch: function( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents: function() {
		page( '/devdocs/app-components/' );
	},

	render: function() {
		return (
			<div className="design-assets" role="main">
				{
					this.props.component
					? <HeaderCake onClick={ this.backToComponents } backText="All App Components">
						{ toTitleCase( this.props.component ) }
					</HeaderCake>
					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search app components…"
						analyticsGroup="Docs">
					</SearchCard>
				}
				<Collection component={ this.props.component } filter={ this.state.filter }>
					<CommentButtons />
					<PostSelector />
					<LikeButtons />
					<FollowButtons />
					<Sites />
					<SitesDropdown />
					<Theme />
					<PostSchedule />
				</Collection>
			</div>
		);
	}
} );
