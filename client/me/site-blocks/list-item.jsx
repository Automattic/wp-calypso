/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import ExternalLink from 'components/external-link';
import Button from 'components/button';

class SiteBlockListItem extends Component {
	render() {
		const { site, translate } = this.props;

		if ( ! site ) {
			return null;
		}

		return (
			<div className="site-blocks__list-item">
				<ExternalLink href={ site.URL }>{ site.name }</ExternalLink>
				<Button
					scary
					borderless
					className="site-blocks__remove-button"
					title={ translate( 'Remove site block' ) }
				>
					<span>{ translate( 'Remove' ) }</span>
				</Button>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		site: getSite( state, ownProps.siteId ),
	};
} )( localize( SiteBlockListItem ) );
