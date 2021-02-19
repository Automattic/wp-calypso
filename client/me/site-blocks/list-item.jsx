/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSite } from 'calypso/state/reader/sites/selectors';
import ExternalLink from 'calypso/components/external-link';
import { Button } from '@automattic/components';
import { unblockSite } from 'calypso/state/reader/site-blocks/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class SiteBlockListItem extends Component {
	unblockSite = () => {
		const { siteId } = this.props;
		this.props.recordTracksEvent( 'calypso_me_unblock_site', {
			blog_id: siteId,
		} );
		this.props.unblockSite( siteId );
	};

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
					title={ translate( 'Unblock site' ) }
					onClick={ this.unblockSite }
				>
					<span>{ translate( 'Unblock' ) }</span>
				</Button>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.siteId ),
		};
	},
	{ unblockSite, recordTracksEvent }
)( localize( SiteBlockListItem ) );
