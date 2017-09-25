/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { map, partial, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ConnectedSubscriptionListItem from 'blocks/reader-subscription-list-item/connected';
import Button from 'components/button';
import { recordAction, recordTrackWithRailcar, recordTracksRailcarRender } from 'reader/stats';
import { requestSiteBlock } from 'state/reader/site-blocks/actions';

export class RecommendedSites extends React.PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		sites: PropTypes.array,
		followSource: PropTypes.string,
	};

	handleSiteDismiss = ( siteId, uiIndex ) => {
		recordTrackWithRailcar( 'calypso_reader_recommended_site_dismissed', this.props.railcar, {
			ui_position: uiIndex,
		} );
		recordAction( 'calypso_reader_recommended_site_dismissed' );
		this.props.requestSiteBlock( siteId );
	};

	handleSiteClick = ( siteId, uiIndex ) => {
		recordTrackWithRailcar( 'calypso_reader_recommended_site_clicked', this.props.railcar, {
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

		function recordRecommendationRender( index ) {
			return function( railcar ) {
				recordTracksRailcarRender( 'recommended_site', railcar, {
					ui_algo: 'following_manage_recommended_site',
					ui_position: index,
				} );
			};
		}

		return (
			<div className="reader-recommended-sites">
				<h1 className="reader-recommended-sites__header">
					<Gridicon icon="thumbs-up" size={ 18 } />
					{ this.props.translate( 'Recommended Sites' ) }
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
									railcar={ site.railcar }
									showEmailSettings={ false }
									showLastUpdatedDate={ false }
									followSource={ followSource }
									onComponentMountWithNewRailcar={ recordRecommendationRender( index ) }
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
