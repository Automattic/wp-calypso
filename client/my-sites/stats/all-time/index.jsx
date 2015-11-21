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
	Gridicon = require( 'components/gridicon' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {
	displayName: 'StatsAllTime',

	mixins: [ toggle( 'allTimeList' ), observe( 'allTimeList' ) ],

	propTypes: {
		allTimeList: React.PropTypes.object.isRequired
	},

	ensureValue: function( value ) {
		if ( value || value === 0 ) {
			return this.numberFormat( value );
		}
		// If no value present, return en-dash
		return String.fromCharCode( 8211 );
	},

	render: function() {
		var bestDay = null,
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			valueClass,
			classes;

		if ( this.props.allTimeList.response['best-views'] && this.props.allTimeList.response['best-views'].day ) {
			bestDay = this.moment( this.props.allTimeList.response['best-views'].day ).format( 'LL' );
		}

		valueClass = classNames( 'stats-all-time__value', {
			'is-loading': this.props.allTimeList.isLoading()
		} );

		classes = [
			'stats-module',
			'stats-all-time',
			{
				'is-expanded': this.state.showModule,
				'is-showing-info': this.state.showInfo,
				'is-loading': this.props.allTimeList.isLoading(),
				'is-non-en': user.data.localeSlug && ( user.data.localeSlug !== 'en' )
			}
		];

		return (
			<div>
				<SectionHeader label={ this.translate( 'All-Time Posts, Views, and Visitors' ) } />
				<Card className={ classNames.apply( null, classes ) }>
					<div className="module-content">
						<div className="module-content-text module-content-text-info">
							<p>{ this.translate( 'These are your site\'s overall total number of Posts, Views and Visitors as well as the day when you had the most number of Views.' ) }</p>
						</div>

					<ul className="stats-all-time__list">
						<li className="stats-all-time__list-item stats-all-time__item-posts">
							<Gridicon icon="posts" size={ 18 } />
							<span className="stats-all-time__label">{ this.translate( 'Posts' ) }</span>
							<span className={ valueClass }>{ this.ensureValue( this.props.allTimeList.response.posts ) }</span>
						</li>
						<li className="stats-all-time__list-item">
							<Gridicon icon="visible" size={ 18 } />
							<span className="stats-all-time__label">{ this.translate( 'Views' ) }</span>
							<span className={ valueClass }>{ this.ensureValue( this.props.allTimeList.response.views ) }</span>
						</li>
						<li className="stats-all-time__list-item">
							<Gridicon icon="user" size={ 18 } />
							<span className="stats-all-time__label">{ this.translate( 'Visitors' ) }</span>
							<span className={ valueClass }>{ this.ensureValue( this.props.allTimeList.response.visitors ) }</span>
						</li>
						<li className="stats-all-time__list-item stats-all-time__best">
							<Gridicon icon="trophy" size={ 18 } />
							<span className="stats-all-time__label">{ this.translate( 'Best Views Ever' ) }</span>
							<span className={ valueClass }>{ this.ensureValue( this.props.allTimeList.response['best-views'] ? this.props.allTimeList.response['best-views'].count : null ) }</span>
							<span className="stats-all-time__best-day">{ bestDay }</span>
						</li>
					</ul>
				</div>
			</Card>
		</div>
		);
	}
} );
