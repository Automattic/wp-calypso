/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:module-countries' );

/**
 * Internal dependencies
 */
var toggle = require( './mixin-toggle' ),
	Geochart = require( './geochart' ),
	StatsList = require( './stats-list' ),
	observe = require( 'lib/mixins/data-observe' ),
	ErrorPanel = require( './module-error' ),
	skeleton = require( './mixin-skeleton' ),
	DownloadCsv = require( './download-csv' ),
	DatePicker = require( './module-date-picker' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatModuleCountries',

	mixins: [ toggle( 'Countries' ), skeleton( 'data' ), observe( 'dataList' ) ],

	data: function( nextProps ) {
		var props = nextProps || this.props;

		return props.dataList.response.data;
	},

	getInitialState: function() {
		return { noData: this.props.dataList.isEmpty() };
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( { noData: nextProps.dataList.isEmpty() } );
	},

	render: function() {
		debug( 'Rendering stats countries module' );

		var countries,
			moduleExpand,
			mapData = [ [ this.translate( 'Country' ).toString(),
			              this.translate( 'Views' ).toString() ] ],
			data = this.data(),
			hasError = this.props.dataList.isError(),
			noData = this.props.dataList.isEmpty(),
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			moduleHeaderTitle,
			summaryPageLink,
			viewSummary,
			geochart,
			moduleToggle,
			classes;

			classes = [
				'stats-module',
				'is-countries',
				{
					'is-expanded': this.state.showModule,
					'summary': this.props.summary,
					'is-loading': this.props.dataList.isLoading(),
					'is-showing-info': this.state.showInfo,
					'has-no-data': noData,
					'is-showing-error': hasError || noData
				}
			];

		// Loop countries and build array for geochart
		data.forEach( function( country ) {
			mapData.push( [ country.label, country.value ] );
		} );

		summaryPageLink = '/stats/' + this.props.period.period + '/countryviews/' + this.props.site.slug + '?startDate=' + this.props.date;


		if ( ! this.props.summary ) {
			moduleExpand = (
				<div key="other" className="module-expand">
					<a href='#'>{ this.translate( 'View All' ) }<span className="right"></span></a>
				</div>
			);
		}

		if ( !this.props.summary ) {
			moduleHeaderTitle = (
				<h4 className="module-header-title"><a href={ summaryPageLink }>{ this.translate( 'Countries' ) }</a></h4>
			);
			moduleToggle = (
				<li className="module-header-action toggle-services">
					<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Expand or collapse panel', { textOnly: true, context: 'Stats panel action' } ) } title={ this.translate( 'Expand or collapse panel', { textOnly: true, context: 'Stats panel action' } ) } onClick={ this.toggleModule }>
						<Gridicon icon="chevron-down" />
					</a>
				</li>
			);

			if ( this.props.dataList.response.viewAll ) {
				viewSummary = (
					<div key='view-all' className='module-expand'>
						<a href={ summaryPageLink }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
					</div>
				);
			}
		} else {
			moduleHeaderTitle = <DatePicker period={ this.props.period.period } date={ this.props.period.startOf } summary={ true } />;
		}

		geochart = <Geochart data={ mapData } dataList={ this.props.dataList } />;

		countries = <StatsList moduleName={ this.props.path } data={ data } />;

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="countryviews">
					<div className="module-header">
						{ moduleHeaderTitle }
						<ul className="module-header-actions">
							<li className="module-header-action toggle-info">
								<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } title={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } onClick={ this.toggleInfo } >
									<Gridicon icon={ infoIcon } />
								</a>
							</li>
							{ moduleToggle }
						</ul>
					</div>
					<div className="module-content">
						<div className="module-content-text module-content-text-info">
							<p>{ this.translate( 'Explore the list to see which countries and regions generate the most traffic to your site.' ) }</p>
							<ul className="documentation">
								<li><a href="http://en.support.wordpress.com/stats/#views-by-country" target="_blank"><Gridicon icon="info-outline" /> { this.translate( 'About Countries' ) }</a></li>
							</ul>
						</div>
						{ ( noData  && ! hasError ) ? <ErrorPanel className='is-empty-message' message={ this.translate( 'No countries recorded' ) } /> : null }

						{ geochart }
						<div className="module-placeholder module-placeholder-block"></div>
						<div className="stats-async-metabox-wrapper">
							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-right">
											<span className="module-content-list-item-value">{ this.translate( 'Views' ) }</span>
										</span>
										<span className="module-content-list-item-label">{ this.translate( 'Country' ) }</span>
									</span>
								</li>
							</ul>
							<div className="module-placeholder is-void"></div>
							{ countries }
						</div>
						{ this.props.summary ?
							<DownloadCsv period={ this.props.period } path={ this.props.path } site={ this.props.site } dataList={ this.props.dataList } />
						 : null }
						{ hasError ? <ErrorPanel className={ 'network-error' } /> : null }
					</div>
					{ viewSummary }
				</div>
			</Card>
		);
	}
} );
