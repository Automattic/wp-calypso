/**
 * External dependencies
 */
import React from 'react';
import union from 'lodash/array/union';

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';

const MAX_ICONS = 4;

export default React.createClass( {
	displayName: 'AllSitesIcon',

	propTypes: {
		sites: React.PropTypes.array.isRequired,
	},

	getMaxSites() {
		return this.props.sites.slice( 0, MAX_ICONS );
	},

	getSitesWithIcons() {
		return this.props.sites.filter( function( site ) {
			return site.icon;
		} ).slice( 0, MAX_ICONS );
	},

	getIcons() {
		let sites = union( this.getSitesWithIcons(), this.getMaxSites() ).slice( 0, MAX_ICONS );
		return sites.map( function( site ) {
			return <SiteIcon site={ site } key={ site.ID + '-icon' } size={ 25 } />;
		} );
	},

	render() {
		const icons = this.getIcons();
		const classes = 'all-sites-icon is-shape-' + this.getMaxSites().length;

		return (
			<div className={ classes }>
				{ icons }
			</div>
		);
	}
} );
