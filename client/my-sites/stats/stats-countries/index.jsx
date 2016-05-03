/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Geochart from '../geochart';
import StatsList from '../stats-list';
import observe from 'lib/mixins/data-observe';
import DownloadCsv from '../stats-download-csv';
import DatePicker from '../stats-date-picker';
import ErrorPanel from '../stats-error';
import Card from 'components/card';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsListLegend from '../stats-list/legend';
import Gridicon from 'components/gridicon';
import SectionHeader from 'components/section-header';
import UpgradeNudge from 'my-sites/upgrade-nudge';

export default React.createClass( {
	displayName: 'StatCountries',

	mixins: [ observe( 'dataList' ) ],

	propTypes: {
		summary: PropTypes.bool,
		dataList: PropTypes.object,
		path: PropTypes.string,
		period: PropTypes.object,
		site: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.boolean
		] ),
		date: PropTypes.string
	},

	data( nextProps ) {
		var props = nextProps || this.props;

		return props.dataList.response.data;
	},

	getInitialState() {
		return { noData: this.props.dataList.isEmpty() };
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( { noData: nextProps.dataList.isEmpty() } );
	},

	getModuleLabel() {
		if ( ! this.props.summary ) {
			return this.translate( 'Countries' );
		}

		return ( <DatePicker period={ this.props.period.period } date={ this.props.period.startOf } summary={ true } /> );
	},

	render() {
		let mapData = [
			[
				this.translate( 'Country' ).toString(),
				this.translate( 'Views' ).toString()
			] ];

		let data = this.data();
		let viewSummary;

		const { dataList, period, site, date, summary, path } = this.props;
		const hasError = dataList.isError();
		const noData = dataList.isEmpty();
		const isLoading = dataList.isLoading();
		const summaryPageLink = '/stats/' + period.period + '/countryviews/' + site.slug + '?startDate=' + date;
		const classes = classNames(
			'stats-module',
			'is-countries',
			{
				summary: summary,
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		);

		// Loop countries and build array for geochart
		data.forEach( function( country ) {
			mapData.push( [ country.label, country.value ] );
		} );

		if ( ! summary && dataList.response.viewAll ) {
			viewSummary = (
				<div key="view-all" className="module-expand">
					<a href={ summaryPageLink }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
				</div>
			);
		}

		return (
			<div>
				<SectionHeader label={ this.getModuleLabel() } href={ ! summary ? summaryPageLink : null }>
					{ this.props.summary
						? ( <DownloadCsv
								period={ period }
								path={ path }
								site={ site }
								dataList={ dataList } /> )
						: null }
				</SectionHeader>
					<Card className={ classes }>
						<div className="countryviews">
							<div className="module-content">
								<div className="module-content-text module-content-text-info">
									<p>{ this.translate( 'Explore the list to see which countries and regions generate the most traffic to your site.' ) }</p>
									<ul className="documentation">
										<li><a href="http://en.support.wordpress.com/stats/#views-by-country" target="_blank"><Gridicon icon="info-outline" /> { this.translate( 'About Countries' ) }</a></li>
									</ul>
								</div>
								{ ( noData && ! hasError )
									? <ErrorPanel className="is-empty-message" message={ this.translate( 'No countries recorded' ) } />
									: null }

								<Geochart data={ mapData } dataList={ dataList } />
								<StatsModulePlaceholder className="is-block" isLoading={ isLoading } />
								<StatsListLegend value={ this.translate( 'Views' ) } label={ this.translate( 'Country' ) } />
								<StatsModulePlaceholder isLoading={ isLoading } />
								<StatsList moduleName={ path } data={ data } />
								{ this.props.summary &&
									<UpgradeNudge
										title={ this.translate( 'Add Google Analytics' ) }
										message={ this.translate( 'Upgrade to a Business Plan for Google Analytics integration.' ) }
										event="googleAnalytics-stats-countries"
										feature="google-analytics"
									/>
								}
								{ hasError
									? <ErrorPanel className={ 'network-error' } />
									: null }
							</div>
							{ viewSummary }
						</div>
					</Card>
			</div>
		);
	}
} );
