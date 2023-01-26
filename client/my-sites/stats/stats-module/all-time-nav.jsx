import config from '@automattic/calypso-config';
import { ComponentSwapper } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight, find, get } from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SegmentedControl from 'calypso/components/segmented-control';
import SelectDropdown from 'calypso/components/select-dropdown';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import './summary-nav.scss';

export const StatsModuleSummaryLinks = ( props ) => {
	const { translate, path, siteSlug, query, period, children, hideNavigation, navigationSwap } =
		props;

	const getSummaryPeriodLabel = () => {
		switch ( period.period ) {
			case 'day':
				return translate( 'Day Summary' );
			case 'week':
				return translate( 'Week Summary' );
			case 'month':
				return translate( 'Month Summary' );
			case 'year':
				return translate( 'Year Summary' );
		}
	};

	const recordStats = ( item ) => {
		props.recordGoogleEvent( 'Stats', `Clicked Summary Link: ${ path } ${ item.stat }` );
	};

	const summaryPath = `/stats/day/${ path }/${ siteSlug }?startDate=${ moment().format(
		'YYYY-MM-DD'
	) }&summarize=1&num=`;
	const summaryPeriodPath = `/stats/${
		period.period
	}/${ path }/${ siteSlug }?startDate=${ period.endOf.format( 'YYYY-MM-DD' ) }`;
	const options = [
		{ value: '0', label: getSummaryPeriodLabel(), path: summaryPeriodPath, stat: 'Period Summary' },
		{ value: '7', label: translate( '7 days' ), path: `${ summaryPath }7`, stat: '7 Days' },
		{ value: '30', label: translate( '30 days' ), path: `${ summaryPath }30`, stat: '30 Days' },
		{ value: '90', label: translate( 'Quarter' ), path: `${ summaryPath }90`, stat: 'Quarter' },
		{ value: '365', label: translate( 'Year' ), path: `${ summaryPath }365`, stat: 'Year' },
		{ value: '-1', label: translate( 'All Time' ), path: `${ summaryPath }-1`, stat: 'All Time' },
	];

	const numberDays = get( query, 'num', '0' );
	const selected = find( options, { value: numberDays } );

	const isHorizontalBarComponentEnabledEverywhere = config.isEnabled(
		'stats/horizontal-bars-everywhere'
	);

	const tabs = (
		<SegmentedControl
			primary
			className={ classnames( 'stats-summary-nav__intervals' ) }
			compact={ false }
		>
			{ options.map( ( i ) => (
				<SegmentedControl.Item
					key={ i.value }
					path={ i.path }
					selected={ i.value === selected.value }
				>
					{ i.label }
				</SegmentedControl.Item>
			) ) }
		</SegmentedControl>
	);
	const select = (
		<SelectDropdown className="section-nav-tabs__dropdown" selectedText={ selected.label }>
			{ options.map( ( i, index ) => (
				<SelectDropdown.Item
					{ ...i }
					key={ 'navTabsDropdown-' + index }
					path={ i.path }
					selected={ i.value === selected.value }
				>
					{ i.label }
				</SelectDropdown.Item>
			) ) }
		</SelectDropdown>
	);

	return (
		<>
			{ isHorizontalBarComponentEnabledEverywhere && (
				<div className="stats-summary-nav">
					<div className="stats-summary-nav__header">
						<DatePicker
							period={ period.period }
							date={ period.startOf }
							path={ path }
							query={ query }
							summary={ false }
						/>
					</div>
					{ ! hideNavigation && (
						<ComponentSwapper
							className={ classnames( 'stats-summary-nav__intervals-container' ) }
							breakpoint="<660px"
							breakpointActiveComponent={ select }
							breakpointInactiveComponent={ tabs }
						/>
					) }
					{ hideNavigation && navigationSwap }
				</div>
			) }
			{ ! isHorizontalBarComponentEnabledEverywhere && (
				<div className="stats-module__all-time-nav">
					<SectionNav selectedText={ selected.label }>
						<NavTabs label={ translate( 'Summary' ) }>
							{ options.map( ( item ) => {
								const onClick = () => {
									recordStats( item );
								};
								return (
									<NavItem
										path={ item.path }
										selected={ item.value === selected.value }
										key={ item.value }
										onClick={ onClick }
									>
										{ item.label }
									</NavItem>
								);
							} ) }
						</NavTabs>
						{ children }
					</SectionNav>
					<DatePicker
						period={ period.period }
						date={ period.startOf }
						path={ path }
						query={ query }
						summary={ false }
					/>
				</div>
			) }
		</>
	);
};

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );

		return { siteSlug };
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsModuleSummaryLinks );
