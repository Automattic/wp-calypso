/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AllSites from 'blocks/all-sites';
import Button from 'components/button';
import Card from 'components/card';
import Site from 'blocks/site';
import Gridicon from 'gridicons';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSite } from 'state/ui/selectors';
import getSelectedOrAllSites from 'state/selectors/get-selected-or-all-sites';
import getVisibleSites from 'state/selectors/get-visible-sites';
import { recordGoogleEvent } from 'state/analytics/actions';
import { hasAllSitesList } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class CurrentSite extends Component {
	static propTypes = {
		siteCount: PropTypes.number.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		anySiteSelected: PropTypes.array,
	};

	switchSites = event => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	render() {
		const { selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length || ( ! selectedSite && ! this.props.hasAllSitesList ) ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
			return (
				<Card className="current-site is-loading">
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
			/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
		}

		return (
			<Card className="current-site">
				{ this.props.siteCount > 1 && (
					<span className="current-site__switch-sites">
						<Button borderless onClick={ this.switchSites }>
							<Gridicon icon="chevron-left" />
							<span className="current-site__switch-sites-label">
								{ translate( 'Switch Site' ) }
							</span>
						</Button>
					</span>
				) }

				{ selectedSite ? (
					<div>
						<Site site={ selectedSite } />
					</div>
				) : (
					<AllSites />
				) }
			</Card>
		);
	}
}

export default connect(
	state => ( {
		selectedSite: getSelectedSite( state ),
		anySiteSelected: getSelectedOrAllSites( state ),
		siteCount: getVisibleSites( state ).length,
		hasAllSitesList: hasAllSitesList( state ),
	} ),
	{ recordGoogleEvent, setLayoutFocus }
)( localize( CurrentSite ) );
