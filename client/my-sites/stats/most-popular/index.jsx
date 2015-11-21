/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	observe = require( 'lib/mixins/data-observe' ),
	toggle = require( 'my-sites/stats/mixin-toggle' ),
	Gridicon = require( 'components/gridicon' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {
	displayName: 'StatsModuleMostPopular',

	propTypes: {
		insightsList: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'insightsList' ), toggle( 'mostPopular' ) ],

	render: function() {
		var emptyMessage = null,
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			data,
			isLoading,
			isEmpty,
			classes;

		data = this.props.insightsList.response;
		isLoading = this.props.insightsList.isLoading();
		isEmpty = ! ( data.percent );

		classes = [
			'stats-module',
			'stats-most-popular',
			'is-site-overview',
			{
				'is-expanded': this.state.showModule,
				'is-showing-info': this.state.showInfo,
				'is-loading': isLoading,
				'is-empty': isEmpty
			}
		];

		if ( isEmpty && ! isLoading ) {
			// should use real notice component or custom class
			emptyMessage = (
				<div className="stats-popular__empty">
					<span className="notice">
						{ this.translate( 'No popular day and time recorded', {
							context: 'Message on empty bar chart in Stats',
							comment: 'Should be limited to 32 characters to prevent wrapping'
						} ) }
					</span>
				</div>
			);
		}

		return (
			<div>
				<SectionHeader label={ this.translate( 'Most Popular Day &amp; Hour' ) } />
				<Card className={ classNames.apply( null, classes ) }>
					<div className="module-content">
						<div className="stats-popular">
							<div className="stats-popular__item">
								<span className="stats-popular__label">{ this.translate( 'Most popular day' ) }</span>
								<span className="stats-popular__day">{ data.day }</span>
								<span className="stats-popular__percentage">{ this.translate( '%(percent)d%% of views', { args: { percent: data.percent || 0 }, context: 'Stats: Percentage of views' } ) }</span>
							</div>
							<div className="stats-popular__item">
								<span className="stats-popular__label">{ this.translate( 'Most popular hour' ) }</span>
								<span className="stats-popular__hour">{ data.hour }</span>
								<span className="stats-popular__percentage">{ this.translate( '%(percent)d%% of views', { args: { percent: data.hour_percent || 0 }, context: 'Stats: Percentage of views' } ) }</span>
							</div>
							{ emptyMessage }
						</div>
					</div>
				</Card>
			</div>
		);
	}
} );
