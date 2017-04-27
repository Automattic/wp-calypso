/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { map, partial } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { recordAction, recordTrack } from 'reader/stats';
import Button from 'components/button';
import { requestSiteBlock } from 'state/reader/blockSite/actions';

export class RecommendedSites extends React.PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		sites: PropTypes.array,
	};

	handleSiteDismiss = ( siteId, uiIndex ) => {
		recordTrack( 'calypso_reader_recommended_site_dismissed', {
			ui_position: uiIndex,
		} );
		recordAction( 'calypso_reader_recommended_site_dismissed' ); // todo: how do we name these?
		this.props.requestSiteBlock( siteId );
	}

	handleSiteClick = ( siteId, uiIndex ) => {
		recordTrack( 'calypso_reader_recommended_site_clicked', {
			ui_position: uiIndex,
			siteId
		} );
		recordAction( 'calypso_reader_recommended_site_clicked' );
	};

	render() {
		const { sites } = this.props;
		return (
			<div className="reader-recommended-sites">
				<h1 className="reader-recommended-sites__header">
					<Gridicon icon="thumbs-up" size={ 18 } />&nbsp;{ this.props.translate( 'Recommended Sites' ) }
				</h1>
				<ul className="reader-recommended-sites__list">
					{
						map(
							sites,
							( siteId, index ) => {
								return ( <li className="reader-recommended-sites__site-list-item" key={ `site-rec-${ siteId }` }>
									<div className="reader-recommended-sites__recommended-post-dismiss">
										<Button borderless
											title={ this.props.translate( 'Dismiss this recommendation' ) }
											onClick={ partial( this.handleSiteDismiss, siteId, index ) }
										>
											<Gridicon icon="cross" size={ 12 } />
										</Button>
									</div>
								</li> );
							}
						)
					}
				</ul>
			</div>
		);
	}
}

export default connect( null, { requestSiteBlock } )( localize( RecommendedSites ) );
