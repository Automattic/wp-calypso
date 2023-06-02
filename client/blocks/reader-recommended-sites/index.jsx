import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import ConnectedListItem from 'calypso/blocks/reader-list-item/connected';
import {
	recordAction,
	recordTrackWithRailcar,
	recordTracksRailcarRender,
} from 'calypso/reader/stats';
import { dismissSite } from 'calypso/state/reader/site-dismissals/actions';

import './style.scss';

export class RecommendedSites extends PureComponent {
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
		this.props.dismissSite( siteId );
	};

	render() {
		const { followSource } = this.props;
		const placeholders = [ {}, {} ];
		const sites = isEmpty( this.props.sites ) ? placeholders : this.props.sites;

		function recordRecommendationRender( index ) {
			return function ( railcar ) {
				recordTracksRailcarRender( 'recommended_site', railcar, {
					ui_algo: 'following_manage_recommended_site',
					ui_position: index,
				} );
			};
		}

		return (
			<div className="reader-recommended-sites">
				<h2 className="reader-recommended-sites__header text-subtitle">
					<Gridicon icon="thumbs-up" size={ 18 } />
					{ this.props.translate( 'Recommended sites' ) }
				</h2>
				<ul className="reader-recommended-sites__list">
					{ sites.map( ( site, index ) => {
						const siteId = site.siteId || site.blogId;
						return (
							<li
								className="reader-recommended-sites__site-list-item card is-compact"
								key={ `site-rec-${ index }` }
							>
								{ siteId && (
									<div className="reader-recommended-sites__recommended-site-dismiss">
										<Button
											borderless
											title={ this.props.translate( 'Dismiss this recommendation' ) }
											onClick={ () => this.handleSiteDismiss( siteId, index ) }
										>
											<Gridicon icon="cross" size={ 18 } />
										</Button>
									</div>
								) }
								<ConnectedListItem
									siteId={ siteId }
									railcar={ site.railcar }
									showNotificationSettings={ false }
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

export default connect( null, { dismissSite } )( localize( RecommendedSites ) );
