/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import toggle from '../mixin-toggle';
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
import Button from 'components/button';

export default React.createClass( {
	displayName: 'StatCountries',

	mixins: [ toggle( 'Countries' ), observe( 'dataList' ) ],

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
			] ],
			data = this.data(),
			hasError = this.props.dataList.isError(),
			noData = this.props.dataList.isEmpty(),
			isLoading = this.props.dataList.isLoading(),
			viewSummary;

		const classes = [
			'stats-module',
			'is-countries',
			{
				summary: this.props.summary,
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		];

		// Loop countries and build array for geochart
		data.forEach( function( country ) {
			mapData.push( [ country.label, country.value ] );
		} );

		const summaryPageLink = '/stats/' + this.props.period.period + '/countryviews/' + this.props.site.slug + '?startDate=' + this.props.date;
		const geochart = <Geochart data={ mapData } dataList={ this.props.dataList } />;
		const countries = <StatsList moduleName={ this.props.path } data={ data } />;

		if ( ! this.props.summary && this.props.dataList.response.viewAll ) {
			viewSummary = (
				<div key="view-all" className="module-expand">
					<a href={ summaryPageLink }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
				</div>
			);
		}

		return (
			<div>
				<SectionHeader label={ this.getModuleLabel() }>
					{ ! this.props.summary
						? ( <Button
								compact
								borderless
								href={ summaryPageLink }
								>
								<Gridicon icon="chevron-right" />
							</Button> )
						: ( <DownloadCsv
								period={ this.props.period }
								path={ this.props.path }
								site={ this.props.site }
								dataList={ this.props.dataList } /> ) }
				</SectionHeader>
					<Card className={ classNames.apply( null, classes ) }>
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

								{ geochart }
								<StatsModulePlaceholder className="is-block" isLoading={ isLoading } />
								<StatsListLegend value={ this.translate( 'Views' ) } label={ this.translate( 'Country' ) } />
								<StatsModulePlaceholder isLoading={ isLoading } />
								{ countries }
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
