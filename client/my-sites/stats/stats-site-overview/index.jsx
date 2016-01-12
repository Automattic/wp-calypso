/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';
import observe from 'lib/mixins/data-observe';
import route from 'lib/route';
import Card from 'components/card';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'StatsSiteOverview',

	proptypes: {
		site: PropTypes.object.isRequired,
		summaryData: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired
	},

	mixins: [ observe( 'summaryData' ) ],

	ensureValue( value ) {
		if ( value || value === 0 ) {
			return this.numberFormat( value );
		}

		// If no value present, return en-dash
		return String.fromCharCode( 8211 );
	},

	isValueLow( value ) {
		return ! value || 0 === value;
	},

	render() {
		const { site, path, summaryData, insights } = this.props;
		const { views, visitors, likes, comments } = summaryData.data;
		const siteStatsPath = [ path, site.slug ].join( '/' );
		let headerPath = siteStatsPath;
		let title;
		let icon;

		if ( insights ) {
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
			<Card key={ site.ID } className="stats__overview stats-module is-site-overview">
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
					<li className={ classNames( 'module-tab', { 'is-low': this.isValueLow( views ) } ) }>
						<a href={ siteStatsPath }>
							<Gridicon icon="visible" size={ 18 } />
							<span className="label">{ this.translate( 'Views', { context: 'noun' } ) }</span>
							<span className="value">{ this.ensureValue( views ) }</span>
						</a>
					</li>
					<li className={ classNames( 'module-tab', { 'is-low': this.isValueLow( visitors ) } ) } >
						<a href={ siteStatsPath + '?tab=visitors' }>
							<Gridicon icon="user" size={ 18 } />
							<span className="label">{ this.translate( 'Visitors', { context: 'noun' } ) }</span>
							<span className="value">{ this.ensureValue( visitors ) }</span>
						</a>
					</li>
					<li className={ classNames( 'module-tab', { 'is-low': this.isValueLow( likes ) } ) } >
						<a href={ siteStatsPath + '?tab=likes' }>
							<Gridicon icon="star" size={ 18 } />
							<span className="label">{ this.translate( 'Likes', { context: 'noun' } ) }</span>
							<span className="value">{ this.ensureValue( likes ) }</span>
						</a>
					</li>
					<li className={ classNames( 'module-tab', { 'is-low': this.isValueLow( comments ) } ) } >
						<a href={ siteStatsPath + '?tab=comments' }>
							<Gridicon icon="comment" size={ 18 } />
							<span className="label">{ this.translate( 'Comments', { context: 'noun' } ) }</span>
							<span className="value">{ this.ensureValue( comments ) }</span>
						</a>
					</li>
				</ul>
			</Card>
		);
	}
} );
