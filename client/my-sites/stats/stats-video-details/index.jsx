/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var StatsList = require( '../stats-list' ),
	StatsListLegend = require( '../stats-list/legend' ),
	StatsModulePlaceholder = require( '../stats-module/placeholder' ),
	Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'StatModuleVideoDetails',

	data: function( nextProps ) {
		var props = nextProps || this.props;

		return props.summaryList.data;
	},

	render: function() {
		var classes,
			isLoading = this.props.summaryList.isLoading();

		classes = [
			'stats-module',
			'is-expanded',
			'summary',
			'is-video-details',
			{
				'is-loading': isLoading,
				'is-showing-info': this.state.showInfo,
				'has-no-data': this.props.summaryList.isEmpty()
			}
		];

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="videoplays">
					<div className="module-header">
						<h4 className="module-header-title">{ this.translate( 'Video Embeds' ) }</h4>
					</div>
					<div className="module-content">
						<StatsListLegend label={ this.translate( 'Page' ) } />
						<StatsModulePlaceholder isLoading={ isLoading } />
						<StatsList moduleName="Video Details" data={ this.props.summaryList.response.pages ? this.props.summaryList.response.pages : [] } />
					</div>
				</div>
			</Card>
		);
	}
} );
