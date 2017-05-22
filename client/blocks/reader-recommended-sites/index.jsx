/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { map, partial, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { recordAction, recordTrack } from 'reader/stats';
import Button from 'components/button';
import { requestSiteBlock } from 'state/reader/site-blocks/actions';
// @todo move this out of following-manage
import ConnectedSubscriptionListItem
	from 'reader/following-manage/connected-subscription-list-item';

export class RecommendedSites extends React.PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		sites: PropTypes.array,
		followSource: PropTypes.string,
	};

	handleSiteDismiss = ( siteId, uiIndex ) => {
		recordTrack( 'calypso_reader_recommended_site_dismissed', {
			ui_position: uiIndex,
		} );
		recordAction( 'calypso_reader_recommended_site_dismissed' );
		this.props.requestSiteBlock( siteId );
	};

	handleSiteClick = ( siteId, uiIndex ) => {
		recordTrack( 'calypso_reader_recommended_site_clicked', {
			ui_position: uiIndex,
			siteId,
		} );
		recordAction( 'calypso_reader_recommended_site_clicked' );
	};

	render() {
		const { sites, followSource } = this.props;

		if ( isEmpty( sites ) ) {
			return null;
		}

		return (
			<div className="reader-recommended-sites">
				<h1 className="reader-recommended-sites__header">
					<Gridicon icon="thumbs-up" size={ 18 } />{ this.props.translate( 'Recommended Sites' ) }
				</h1>
				<ul className="reader-recommended-sites__list">
					{ map( sites, ( site, index ) => {
						const siteId = site.siteId || site.blogId;
						return (
							<li
								className="reader-recommended-sites__site-list-item"
								key={ `site-rec-${ siteId }` }
							>
								<div className="reader-recommended-sites__recommended-site-dismiss">
									<Button
										borderless
										title={ this.props.translate( 'Dismiss this recommendation' ) }
										onClick={ partial( this.handleSiteDismiss, siteId, index ) }
									>
										<Gridicon icon="cross" size={ 18 } />
									</Button>
								</div>
								<ConnectedSubscriptionListItem
									siteId={ siteId }
									showEmailSettings={ false }
									showLastUpdatedDate={ false }
									followSource={ followSource }
								/>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

export default connect( null, { requestSiteBlock } )( localize( RecommendedSites ) );
