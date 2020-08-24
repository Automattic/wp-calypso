/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { union } from 'lodash';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';

/**
 * Style dependencies
 */
import './all-sites-icon.scss';

const MAX_ICONS = 10;

export default class AllSitesIcon extends React.Component {
	static propTypes = {
		sites: PropTypes.array.isRequired,
	};

	getMaxSites() {
		return this.props.sites.slice( 0, MAX_ICONS );
	}

	getSitesWithIcons() {
		return this.props.sites.filter( ( site ) => site.icon ).slice( 0, MAX_ICONS );
	}

	getIcons() {
		const sites = union( this.getSitesWithIcons(), this.getMaxSites() ).slice( 0, MAX_ICONS );
		return sites.map( ( site ) => <SiteIcon site={ site } key={ site.ID } size={ 14 } /> );
	}

	render() {
		const icons = this.getIcons();
		const classes = `all-sites-icon has-${ this.getMaxSites().length }-icons`;

		return <div className={ classes }>{ icons }</div>;
	}
}
