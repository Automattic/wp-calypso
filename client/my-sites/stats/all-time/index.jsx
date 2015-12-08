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

	ensureValue: function( value ) {
		if ( value || value === 0 ) {
			return this.numberFormat( value );
		}
		// If no value present, return en-dash
		return String.fromCharCode( 8211 );
	},

	isLow: function( value ) {
		return ! value || 0 === value
	},

	render: function() {
		var bestDay = null,
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			valueClass,
			bestViews,
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

		bestViews = this.props.allTimeList.response['best-views'] ? this.props.allTimeList.response['best-views'].count : null;

		return (
			<Card className={ classNames.apply( null, classes ) }>
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

				<ul className="stats-all-time__list">
					<li className="stats-all-time__list-item stats-all-time__item-posts">
						<Gridicon icon="posts" size={ 18 } />
						<span className="stats-all-time__label">{ this.translate( 'Posts' ) }</span>
						<span className={ classNames( valueClass, { 'is-low': this.isLow( this.props.allTimeList.response.posts ) } ) }>{ this.ensureValue( this.props.allTimeList.response.posts ) }</span>
					</li>
					<li className="stats-all-time__list-item">
						<Gridicon icon="visible" size={ 18 } />
						<span className="stats-all-time__label">{ this.translate( 'Views' ) }</span>
						<span className={ classNames( valueClass, { 'is-low': this.isLow( this.props.allTimeList.response.views ) } ) }>{ this.ensureValue( this.props.allTimeList.response.views ) }</span>
					</li>
					<li className="stats-all-time__list-item">
						<Gridicon icon="user" size={ 18 } />
						<span className="stats-all-time__label">{ this.translate( 'Visitors' ) }</span>
						<span className={ classNames( valueClass, { 'is-low': this.isLow( this.props.allTimeList.response.visitors ) } ) }>{ this.ensureValue( this.props.allTimeList.response.visitors ) }</span>
					</li>
					<li className="stats-all-time__list-item stats-all-time__best">
						<Gridicon icon="trophy" size={ 18 } />
						<span className="stats-all-time__label">{ this.translate( 'Best Views Ever' ) }</span>
						<span className={ classNames( valueClass, { 'is-low': this.isLow( bestViews ) } ) }>{ this.ensureValue( bestViews ) }</span>
						<span className="stats-all-time__best-day">{ bestDay }</span>
					</li>
				</ul>
			</div>
		</Card>
		);
	}
} );
