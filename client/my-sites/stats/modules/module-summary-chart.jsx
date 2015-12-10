/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	isEqual = require( 'lodash/lang/isEqual' ),
	debug = require( 'debug' )( 'calypso:stats:module-summary-chart' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	ElementChart = require( 'components/chart' ),
	StatTab = require( './module-tab' ),
	analytics = require( 'analytics' ),
	Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'StatsSummaryChart',

	propTypes: {
		dataList: React.PropTypes.object.isRequired,
		labelKey: React.PropTypes.string.isRequired,
		dataKey: React.PropTypes.string.isRequired
	},

	mixins: [ observe( 'dataList' ) ],

	getInitialState: function() {
		var chartDataLength = this.props.dataList.response.data ? this.props.dataList.response.data.length : null;

		return {
			selectedBar: chartDataLength ? this.props.dataList.response.data[ chartDataLength - 1 ] : null
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		var selectedBar = this.state.selectedBar,
			chartDataLength = nextProps.dataList.response.data ? nextProps.dataList.response.data.length : null;

		// Always default to the last bar being selected
		if ( ! selectedBar && chartDataLength ) {
			selectedBar = nextProps.dataList.response.data[ chartDataLength - 1 ];
		}

		this.setState( {
			selectedBar: selectedBar
		} );
	},

	barClick: function( bar ) {
		var selectedBar = this.props.dataList.response.data.filter( function( data ) {
			return isEqual( data, bar.data );
		}, this ).shift();

		analytics.ga.recordEvent( 'Stats', 'Clicked Summary Chart Bar' );
		this.setState( {
			selectedBar: selectedBar
		} );
	},

	buildTooltipData: function( item ) {
		var tooltipData = [],
			sectionClass;

		tooltipData.push( {
			label: item.period,
			className: 'is-date-label',
			value: null
		} );

		switch ( this.props.labelClass ) {
			case 'visible':
				sectionClass = 'is-views';
				break;
			case 'video':
				sectionClass = 'is-video';
				break;
			default:
				sectionClass = null;
		}

		tooltipData.push( {
			label: this.props.tabLabel,
			icon: this.props.labelClass,
			className: sectionClass,
			value: item.value
		} );

		return tooltipData;
	},

	buildChartData: function() {
		var data;

		data = this.props.dataList.response.data.map( function( record ) {
			var chartDataItem,
				className;

			className = classNames( {
				'is-selected': isEqual( this.state.selectedBar, record )
			} );

			chartDataItem = {
				label: record.period,
				value: record.value,
				nestedValue: null,
				className: className,
				data: record
			};

			chartDataItem.tooltipData = this.buildTooltipData( record );

			return chartDataItem;
		}, this );

		return data;
	},

	chartTabs: function() {
		var tabOptions,
			label,
			tabs,
			selectedBar = this.state.selectedBar;

		label = selectedBar ? ': ' + selectedBar[ this.props.labelKey ] : '';
		tabOptions = {
			attr: this.props.labelKey,
			value: selectedBar ? this.state.selectedBar[ this.props.dataKey ] : null,
			selected: true,
			className: this.props.labelClass,
			label: this.props.tabLabel + label
		};

		tabs = <StatTab key='chart-tab' tab={ tabOptions } />;

		return ( <ul className="module-tabs is-expanded">{ tabs }</ul> );
	},

	render: function() {
		var classes;
		debug( 'Rendering stats/post.jsx', this.props );

		classes = [
			'stats-module',
			'is-summary-chart',
			{
				'is-loading': this.props.dataList.isLoading()
			}
		];

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="module-chart module-placeholder is-void is-chart"></div>
				<ElementChart key='chart'
					loading={ this.props.dataList.isLoading() }
					data={ this.buildChartData() }
					barClick={ this.barClick } />
				{ this.chartTabs() }
			</Card>
		);
	}
} );
