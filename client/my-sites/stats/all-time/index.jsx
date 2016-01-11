/**
* External dependencies
*/
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	Card = require( 'components/card' ),
	user = require( 'lib/user' )(),
	toggle = require( '../mixin-toggle' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsAllTime',

	mixins: [ toggle( 'allTimeList' ), observe( 'allTimeList' ) ],

	propTypes: {
		allTimeList: React.PropTypes.object.isRequired
	},

	renderValue: function( value ) {
		var valueClass = classNames( 'value', {
				'is-loading': this.props.allTimeList.isLoading(),
				'is-low': ! value || 0 === value
			} ),
			displayValue = String.fromCharCode( 8211 );

		if ( value || 0 === value ) {
			displayValue = this.numberFormat( value );
		}

		return <span className={ valueClass }>{ displayValue }</span>;
	},

	render: function() {
		var infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			allTimeList = this.props.allTimeList.response,
			bestDay,
			bestViews,
			classes;

		if ( allTimeList['best-views'] && allTimeList['best-views'].day ) {
			bestDay = this.moment( allTimeList['best-views'].day ).format( 'LL' );
		}

		classes = {
			'is-expanded': this.state.showModule,
			'is-showing-info': this.state.showInfo,
			'is-loading': this.props.allTimeList.isLoading(),
			'is-non-en': user.data.localeSlug && ( user.data.localeSlug !== 'en' )
		};

		bestViews = allTimeList['best-views'] ? allTimeList['best-views'].count : null;

		return (
			<Card className={ classNames( 'stats-module', 'stats-all-time', classes ) }>
				<div className="module-header">
				<h1 className="module-header-title">{ this.translate( 'All-time posts, views, and visitors' ) }</h1>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a
								href="#"
								className="module-header-action-link"
								aria-label={
									this.translate(
										'Show or hide panel information',
										{ context: 'Stats panel action' }
									)
								}
								title={
									this.translate(
										'Show or hide panel information',
										{ context: 'Stats panel action' }
									)
								}
								onClick={
									this.toggleInfo
								}
							>
								<Gridicon icon={ infoIcon } />
							</a>
						</li>
					</ul>
				</div>
				<div className="module-content">
					<div className="module-content-text module-content-text-info">
						<p>{ this.translate( 'These are your site\'s overall total number of Posts, Views and Visitors as well as the day when you had the most number of Views.' ) }</p>
					</div>

				<ul className="module-tabs">
					<li className="module-tab">
						<span className="no-link">
							<Gridicon icon="posts" size={ 18 } />
							<span className="label">{ this.translate( 'Posts' ) }</span>
							{ this.renderValue( allTimeList.posts ) }
						</span>
					</li>
					<li className="module-tab">
						<span className="no-link">
							<Gridicon icon="visible" size={ 18 } />
							<span className="label">{ this.translate( 'Views' ) }</span>
							{ this.renderValue( allTimeList.views ) }
						</span>
					</li>
					<li className="module-tab">
						<span className="no-link">
							<Gridicon icon="user" size={ 18 } />
							<span className="label">{ this.translate( 'Visitors' ) }</span>
							{ this.renderValue( allTimeList.visitors ) }
						</span>
					</li>
					<li className="module-tab is-best">
						<span className="no-link">
							<Gridicon icon="trophy" size={ 18 } />
							<span className="label">{ this.translate( 'Best Views Ever' ) }</span>
							{ this.renderValue( bestViews ) }
							<span className="stats-all-time__best-day">{ bestDay }</span>
						</span>
					</li>
				</ul>
			</div>
		</Card>
		);
	}
} );
