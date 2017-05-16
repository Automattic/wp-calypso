/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AllSites from 'my-sites/all-sites';
import analytics from 'lib/analytics';
import AsyncLoad from 'components/async-load';
import Button from 'components/button';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedOrAllSites } from 'state/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import Gridicon from 'gridicons';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import Site from 'blocks/site';
import SiteNotice from './notice';

class CurrentSite extends Component {
	static propTypes = {
		isPreviewShowing: React.PropTypes.bool,
		siteCount: React.PropTypes.number.isRequired,
		setLayoutFocus: React.PropTypes.func.isRequired,
		selectedSite: React.PropTypes.object,
		translate: React.PropTypes.func.isRequired,
		anySiteSelected: React.PropTypes.array
	};

	switchSites = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	previewSite = ( event ) => this.props.onClick && this.props.onClick( event );

	render() {
		const { selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length ) {
			return (
				<Card className="current-site is-loading">
					{ this.props.siteCount > 1 &&
						<span className="current-site__switch-sites">&nbsp;</span>
					}
					<div className="site">
						<a className="site__content">
							<div className="site-icon" />
							<div className="site__info">
								<span className="site__title">{ translate( 'Loading My Sites…' ) }</span>
							</div>
						</a>
					</div>
				</Card>
			);
		}

		return (
			<Card className="current-site">
				{ this.props.siteCount > 1 &&
					<span className="current-site__switch-sites">
						<Button compact borderless onClick={ this.switchSites }>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ translate( 'Switch Site' ) }
						</Button>
					</span>
				}
				{ selectedSite
					? <div>
						<Site site={ selectedSite } />
						<a
							href={ selectedSite.URL }
							onClick={ this.previewSite }
							className={ `current-site__view-site${ this.props.isPreviewShowing ? ' selected' : '' }` }
						>
							<span className="current-site__view-site-text">
								{ translate( 'Site Preview' ) }
							</span>
							<Gridicon icon="computer" />
						</a>
					</div>
					: <AllSites />
				}
				<AsyncLoad require="my-sites/current-site/domain-warnings"
					noPlaceholder={ true } />
				<SiteNotice site={ selectedSite } />
			</Card>
		);
	}
}

export default connect(
	( state ) => {
		const user = getCurrentUser( state );

		return {
			selectedSite: getSelectedSite( state ),
			anySiteSelected: getSelectedOrAllSites( state ),
			siteCount: get( user, 'visible_site_count', 0 ),
		};
	},
	{ setLayoutFocus },
)( localize( CurrentSite ) );
