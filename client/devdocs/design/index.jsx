/**
* External dependencies
*/
var React = require( 'react' ),
	page = require( 'page' ),
	toTitleCase = require( 'to-title-case' ),
	trim = require( 'lodash/string/trim' );

/**
 * Internal dependencies
 */
var SearchCard = require( 'components/search-card' ),
	SearchDemo = require( 'components/search/docs/example' ),
	Notices = require( 'components/notice/docs/example' ),
	Buttons = require( 'components/button/docs/example' ),
	ButtonGroups = require( 'components/button-group/docs/example' ),
	AddNewButtons = require( 'components/add-new-button/docs/example' ),
	CommentButtons = require( 'components/comment-button/docs/example' ),
	LikeButtons = require( 'components/like-button/docs/example' ),
	FollowButtons = require( 'components/follow-button/docs/example' ),
	Accordions = require( 'components/accordion/docs/example' ),
	Gridicons = require( 'components/gridicon/docs/example' ),
	SelectDropdown = require( 'components/select-dropdown/docs/example' ),
	SegmentedControl = require( 'components/segmented-control/docs/example' ),
	Cards = require( 'components/card/docs/example' ),
	Sites = require( 'lib/sites-list/docs/example' ),
	SitesDropdown = require( 'components/sites-dropdown/docs/example' ),
	TokenFields = require( 'components/token-field/docs/example' ),
	CountedTextareas = require( 'components/forms/counted-textarea/docs/example' ),
	ProgressBar = require( 'components/progress-bar/docs/example' ),
	Popovers = require( 'components/popover/docs/example' ),
	Ranges = require( 'components/forms/range/docs/example' ),
	Gauge = require( 'components/gauge/docs/example' ),
	Headers = require( 'components/header-cake/docs/example' ),
	DropZones = require( 'components/drop-zone/docs/example' ),
	FormFields = require( 'components/forms/docs/example' ),
	SectionNav = require( 'components/section-nav/docs/example' ),
	Spinners = require( 'components/spinner/docs/example' ),
	Rating = require( 'components/rating/docs/example' ),
	DatePicker = require( 'components/date-picker/docs/example' ),
	Theme = require( 'components/theme/docs/example' ),
	PostSchedule = require( 'components/post-schedule/docs/example' ),
	InputChrono = require( 'components/input-chrono/docs/example' ),
	TimezoneDropdown = require( 'components/timezone-dropdown/docs/example' ),
	ClipboardButtons = require( 'components/forms/clipboard-button/docs/example' ),
	HeaderCake = require( 'components/header-cake' ),
	InfoPopover = require( 'components/info-popover/docs/example' ),
	FoldableCard = require( 'components/foldable-card/docs/example' ),
	SectionHeader = require( 'components/section-header/docs/example' ),
	Flag = require( 'components/flag/docs/example' ),
	PaymentLogo = require( 'components/payment-logo/docs/example' ),
	Count = require( 'components/count/docs/example' ),
	Version = require( 'components/version/docs/example' ),
	BulkSelect = require( 'components/bulk-select/docs/example' ),
	ExternalLink = require( 'components/external-link/docs/example' ),
	FeatureGate = require( 'components/feature-example/docs/example' ),
	Collection,
	FilterSummary,
	Hider;

Hider = React.createClass( {
	displayName: 'Hider',

	propTypes: {
		hide: React.PropTypes.bool,
	},

	shouldComponentUpdate: function( nextProps, nextState ) {
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
				<Hider hide={ this.shouldWeHide( example ) } key={ "example-" + example.type.displayName }>
					{ example }
				</Hider>
			);
		});

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
	displayName: 'DesignAssets',

	getInitialState: function() {
		return { filter: '' };
	},

	onSearch: function( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents: function() {
		page( '/devdocs/design/' );
	},

	render: function() {
		return (
			<div className="design-assets" role="main">
				{
					this.props.component
					? <HeaderCake onClick={ this.backToComponents } backText="All Components">
						{ toTitleCase( this.props.component ) }
					</HeaderCake>
					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search components…"
						analyticsGroup="Docs">
					</SearchCard>
				}
				<Collection component={ this.props.component } filter={ this.state.filter }>
					<Notices />
					<Buttons />
					<ButtonGroups />
					<AddNewButtons />
					<CommentButtons />
					<Gridicons />
					<LikeButtons />
					<FollowButtons />
					<Accordions />
					<SelectDropdown searchKeywords="menu" />
					<SegmentedControl />
					<Cards />
					<Sites />
					<SitesDropdown />
					<TokenFields />
					<CountedTextareas />
					<ProgressBar />
					<Popovers />
					<InfoPopover />
					<Ranges />
					<Gauge />
					<SearchDemo />
					<Headers />
					<DropZones />
					<FormFields searchKeywords="input textbox textarea radio"/>
					<ClipboardButtons />
					<Rating />
					<Count />
					<Version />
					<ExternalLink />
					<FeatureGate />
					<DatePicker />
					<Spinners />
					<Theme />
					<PostSchedule />
					<InputChrono />
					<TimezoneDropdown />
					<FoldableCard />
					<Flag />
					<PaymentLogo />
					<BulkSelect />
					<SectionHeader />
					<SectionNav />
				</Collection>
			</div>
		);
	}
} );
