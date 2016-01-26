/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var toggle = require( '../mixin-toggle' ),
	skeleton = require( '../mixin-skeleton' ),
	observe = require( 'lib/mixins/data-observe' ),
	ErrorPanel = require( '../stats-error' ),
	InfoPanel = require( '../info-panel' ),
	StatsList = require( '../stats-list' ),
	StatsListLegend = require( '../stats-list/legend' ),
	DownloadCsv = require( '../stats-download-csv' ),
	DatePicker = require( '../stats-date-picker' ),
	Card = require( 'components/card' ),
	StatsModulePlaceholder = require( './placeholder' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatModule',

	mixins: [ toggle(), skeleton( 'data' ), observe( 'dataList' ) ],

	data: function() {
		return this.props.dataList.response.data;
	},

	getInitialState: function() {
		return { noData: this.props.dataList.isEmpty() };
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( { noData: nextProps.dataList.isEmpty() } );
	},

	hasSummaryPage: function() {
		var noSummaryPages = [ 'tags-categories', 'publicize' ];
		return -1 === noSummaryPages.indexOf( this.props.path );
	},

	viewAllHandler: function( event ) {
		var summaryPageLink = '/stats/' + this.props.period.period + '/' + this.props.path + '/' + this.props.site.slug + '?startDate=' + this.props.date;

		event.preventDefault();

		if ( this.props.beforeNavigate ) {
			this.props.beforeNavigate();
		}
		page( summaryPageLink );
	},

	render: function() {
		var data = this.data(),
			noData = this.props.dataList.isEmpty(),
			hasError = this.props.dataList.isError(),
			headerLink = this.props.moduleStrings.title,
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			isLoading = this.props.dataList.isLoading(),
			moduleHeaderTitle,
			statsList,
			viewSummary,
			moduleToggle,
			classes;

		classes = classNames(
			'stats-module',
			{
				'is-expanded': this.state.showModule,
				'is-loading': isLoading,
				'is-showing-info': this.state.showInfo,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		);

		statsList = <StatsList moduleName={ this.props.path } data={ data } followList={ this.props.followList } />;

		if ( this.hasSummaryPage() ) {
			headerLink = ( <a href="#" onClick={ this.viewAllHandler }>{ this.props.moduleStrings.title }</a> );
		}

		if ( !this.props.summary ) {
			moduleHeaderTitle = (
				<h4 className="module-header-title">{ headerLink }</h4>
			);
			moduleToggle = (
				<li className="module-header-action toggle-services"><a href="#" className="module-header-action-link" aria-label={ this.translate( 'Expand or collapse panel', { context: 'Stats panel action' } ) } title={ this.translate( 'Expand or collapse panel', { context: 'Stats panel action' } ) } onClick={ this.toggleModule }><Gridicon icon="chevron-down" /></a></li>
			);

			if ( this.props.dataList.response.viewAll ) {
				viewSummary = (
					<div key="view-all" className="module-expand">
						<a href="#" onClick={ this.viewAllHandler }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
					</div>
				);
			}
		} else {
			moduleHeaderTitle = <DatePicker period={ this.props.period.period } date={ this.props.period.startOf } summary={ true } />;
		}

		return (
			<Card className={ classes }>
				<div className={ this.props.className }>
					<div className="module-header">
						{ moduleHeaderTitle }
						<ul className="module-header-actions">
							<li className="module-header-action toggle-info"><a href="#" className="module-header-action-link" aria-label={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) } title={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) } onClick={ this.toggleInfo } ><Gridicon icon={ infoIcon } /></a></li>
							{ moduleToggle }
						</ul>
					</div>
					<div className="module-content">
						<InfoPanel module={ this.props.path } />
						{ ( noData && ! hasError ) ? <ErrorPanel className="is-empty-message" message={ this.props.moduleStrings.empty } /> : null }
						{ hasError ? <ErrorPanel className={ 'network-error' } /> : null }
						<StatsListLegend value={ this.props.moduleStrings.value } label={ this.props.moduleStrings.item } />
						<StatsModulePlaceholder isLoading={ isLoading } />
						{ statsList }
						{ this.props.summary
							? <DownloadCsv period={ this.props.period } path={ this.props.path } site={ this.props.site } dataList={ this.props.dataList } />
						: null }
					</div>
					{ viewSummary }
				</div>
			</Card>
		);
	}
} );
