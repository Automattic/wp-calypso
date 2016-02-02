/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );
import { isEmpty } from 'lodash/lang';

/**
 * Internal dependencies
 */
var toggle = require( '../mixin-toggle' ),
	Geochart = require( '../geochart' ),
	StatsList = require( '../stats-list' ),
	DownloadCsv = require( '../stats-download-csv' ),
	DatePicker = require( '../stats-date-picker' ),
	ErrorPanel = require( '../stats-error' ),
	Card = require( 'components/card' ),
	StatsModulePlaceholder = require( '../stats-module/placeholder' ),
	StatsListLegend = require( '../stats-list/legend' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatCountries',

	mixins: [ toggle( 'Countries' ) ],

	render: function() {
		const { moduleState } = this.props;
		const { statsCountryViews } = moduleState;
		const { response } = statsCountryViews;
		const statsCountryViewsData = response && ! isEmpty( response.data )
			? response.data
			: [];

		var countries,
			mapData = [
				[
					this.translate( 'Country' ).toString(),
					this.translate( 'Views' ).toString()
				]
			],
hasError = false, // @TODO -- was this.props.dataList.isError()
			noData = isEmpty( statsCountryViewsData ),
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			isLoading = moduleState.isLoading,
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
				summary: this.props.summary,
				'is-loading': isLoading,
				'is-showing-info': this.state.showInfo,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		];

		// Loop countries and build array for geochart
		statsCountryViewsData.forEach( function( country ) {
			mapData.push( [ country.label, country.value ] );
		} );

		summaryPageLink = '/stats/' + this.props.period.period + '/countryviews/' + this.props.site.slug + '?startDate=' + this.props.date;

		if ( ! this.props.summary ) {
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

			if ( response && response.viewAll ) {
				viewSummary = (
					<div key="view-all" className="module-expand">
						<a href={ summaryPageLink }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
					</div>
				);
			}
		} else {
			moduleHeaderTitle = <DatePicker period={ this.props.period.period } date={ this.props.period.startOf } summary={ true } />;
		}

		geochart = <Geochart mapData={ mapData } response={ response } />;
		countries = <StatsList moduleName={ this.props.path } data={ statsCountryViewsData } />;

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
						{ ( noData && ! hasError ) ? <ErrorPanel className="is-empty-message" message={ this.translate( 'No countries recorded' ) } /> : null }

						{ geochart }
						<StatsModulePlaceholder className="is-block" isLoading={ isLoading } />
						<StatsListLegend value={ this.translate( 'Views' ) } label={ this.translate( 'Country' ) } />
						<StatsModulePlaceholder isLoading={ isLoading } />
						{ countries }
						{ this.props.summary
							? <DownloadCsv period={ this.props.period } path={ this.props.path } site={ this.props.site } response={ response } />
							: null

							// @TODO !!!
						}
						{ hasError ? <ErrorPanel className={ 'network-error' } /> : null }
					</div>
					{ viewSummary }
				</div>
			</Card>
		);
	}
} );
