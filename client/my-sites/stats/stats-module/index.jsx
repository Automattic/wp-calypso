/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import ErrorPanel from '../stats-error';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import DownloadCsv from '../stats-download-csv';
import DatePicker from '../stats-date-picker';
import Card from 'components/card';
import StatsModulePlaceholder from './placeholder';
import SectionHeader from 'components/section-header';

export default React.createClass( {
	displayName: 'StatModule',

	mixins: [ observe( 'dataList' ) ],

	data() {
		return this.props.dataList.response.data;
	},

	getDefaultProps() {
		return {
			showPeriodDetail: false
		};
	},

	getInitialState() {
		return { noData: this.props.dataList.isEmpty() };
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( { noData: nextProps.dataList.isEmpty() } );
	},

	getModuleLabel() {
		if ( ! this.props.summary ) {
			return this.props.moduleStrings.title;
		}

		return ( <DatePicker period={ this.props.period.period } date={ this.props.period.startOf } summary={ true } /> );
	},

	getHref() {
		// Some modules do not have view all abilities
		if ( ! this.props.summary && this.props.period && this.props.path && this.props.site ) {
			return '/stats/' + this.props.period.period + '/' + this.props.path + '/' + this.props.site.slug + '?startDate=' + this.props.date;
		}

		return null;
	},

	render() {
		const data = this.data();
		const noData = this.props.dataList.isEmpty();
		const hasError = this.props.dataList.isError();
		const isLoading = this.props.dataList.isLoading();
		const {
			className,
			summary,
			site,
			path,
			dataList,
			period,
			moduleStrings,
			followList } = this.props;
		let viewSummary;

		const classes = classNames(
			'stats-module',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		);

		if ( ! summary && dataList.response.viewAll ) {
			viewSummary = (
				<div key="view-all" className="module-expand">
					<a href={ this.getHref() }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
				</div>
			);
		}

		const statsList = <StatsList moduleName={ path } data={ data } followList={ followList } />;

		return (
			<div>
				<SectionHeader label={ this.getModuleLabel() } href={ ! summary ? this.getHref() : null }>
					{ summary
						? ( <DownloadCsv period={ period } path={ path } site={ site } dataList={ dataList } /> )
						: null }
				</SectionHeader>
				<Card compact className={ classes }>
					<div className={ className }>
						<div className="module-content">
							{ ( noData && ! hasError ) ? <ErrorPanel className="is-empty-message" message={ moduleStrings.empty } /> : null }
							{ hasError ? <ErrorPanel className={ 'network-error' } /> : null }
							<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
							<StatsModulePlaceholder isLoading={ isLoading } />
							{ statsList }
						</div>
					</div>
					{ viewSummary }
				</Card>
			</div>

		);
	}
} );
