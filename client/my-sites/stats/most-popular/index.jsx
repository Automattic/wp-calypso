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
	Gridicon = require( 'components/gridicon' );

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
			<Card className={ classNames.apply( null, classes ) }>
				<div className="module-header">
					<h1 className="module-header-title">{ this.translate( 'Most popular day and hour' ) }</h1>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } title={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } onClick={ this.toggleInfo } >
								<Gridicon icon={ infoIcon } />
							</a>
						</li>
					</ul>
				</div>
				<div className="module-content">
					<div className="module-content-text module-content-text-info">
						<p>{ this.translate( 'This is the day and hour when you have been getting the most Views on average. The best timing for publishing a post may be around this period.' ) }</p>
					</div>
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
		);
	}
} );
