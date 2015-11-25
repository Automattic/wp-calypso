/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:module-site-overview' );

/**
 * Internal dependencies
 */
var SiteIcon = require( 'components/site-icon' ),
	observe = require( 'lib/mixins/data-observe' ),
	route = require( 'lib/route' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsModuleSiteOverview',

	proptypes: {
		site: React.PropTypes.object.isRequired,
		summaryData: React.PropTypes.object.isRequired,
		path: React.PropTypes.string.isRequired
	},

	mixins: [ observe( 'summaryData' ) ],

	ensureValue: function( value ) {
		if ( value || value === 0 ) {
			return this.numberFormat( value );
		} else {
			// If no value present, return en-dash
			return String.fromCharCode( 8211 );
		}
	},

	render: function() {
		debug( 'Rendering module site overview' );

		var site = this.props.site,
			statTabs = [ 'views', 'visitors', 'likes', 'comments' ],
			data = this.props.summaryData.data,
			classSets = {},
			siteStatsPath = [ this.props.path, site.slug ].join( '/' ),
			headerPath = siteStatsPath,
			classes,
			title,
			icon = null;

		statTabs.forEach( function( tabName ) {
			var tabClassOptions = {};
			if ( data && 0 === data[ tabName ] ) {
				tabClassOptions[ 'is-low' ] = true;
			}
			tabClassOptions[ 'module-tab' ] = true;
			tabClassOptions[ 'is-' + tabName ] = true;
			classSets[ tabName ] = classNames( tabClassOptions );
		} );

		classes = [
			'stats__overview',
			'stats-module',
			'is-site-overview'
		];

		if ( this.props.insights ) {
			title = this.translate( 'Today\'s Stats' );
		} else {
			title = site.title;
			icon = (
				<div className="module-header__site-icon">
					<SiteIcon site={ site } size={ 24 } />
				</div>
			);

			headerPath = route.getStatsDefaultSitePage( site.slug );
		}

		return (
			<Card key={ site.ID } className={ classNames.apply( null, classes ) }>

				<div className="module-header">
					<h3 className="module-header-title">
						<a href={ headerPath } className="module-header__link">
							{ icon }
							<span className="module-header__right-icon">
								<Gridicon icon="stats" />
							</span>
							{ title }
						</a>
					</h3>
				</div>

				<ul className="module-tabs">
					<li className={ classSets.views }>
						<a href={ siteStatsPath }><Gridicon icon="visible" size={ 18 } /><span className="label">{ this.translate( 'Views', { context:'noun' } ) }</span><span className="value">{ this.ensureValue( data.views ) }</span></a>
					</li>
					<li className={ classSets.visitors }>
						<a href={ siteStatsPath + '?tab=visitors' }><Gridicon icon="user" size={ 18 } /><span className="label">{ this.translate( 'Visitors', { context:'noun' } ) }</span><span className="value">{ this.ensureValue( data.visitors ) }</span></a>
					</li>
					<li className={ classSets.likes }>
						<a href={ siteStatsPath + '?tab=likes' }><Gridicon icon="star" size={ 18 } /><span className="label">{ this.translate( 'Likes', { context:'noun' } ) }</span> <span className="value">{ this.ensureValue( data.likes ) }</span></a>
					</li>
					<li className={ classSets.comments }>
						<a href={ siteStatsPath + '?tab=comments' }><Gridicon icon="comment" size={ 18 } /><span className="label">{ this.translate( 'Comments', { context:'noun' } ) }</span> <span className="value">{ this.ensureValue( data.comments ) }</span></a>
					</li>
				</ul>
			</Card>
		);
	}
} );
