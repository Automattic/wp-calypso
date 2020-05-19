/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { isEnabled } from 'config';

/**
 * Internal dependencies
 */
import AllSites from 'blocks/all-sites';
import AsyncLoad from 'components/async-load';
import { Button, Card } from '@automattic/components';
import Site from 'blocks/site';
import Gridicon from 'components/gridicon';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSite } from 'state/ui/selectors';
import getSelectedOrAllSites from 'state/selectors/get-selected-or-all-sites';
import { getCurrentUserSiteCount } from 'state/current-user/selectors';
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

	switchSites = ( event ) => {
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
						<Site site={ selectedSite } homeLink={ true } />
					</div>
				) : (
					<AllSites />
				) }
				{ isEnabled( 'current-site/domain-warning' ) && (
					<AsyncLoad require="my-sites/current-site/domain-warnings" placeholder={ null } />
				) }
				{ isEnabled( 'current-site/stale-cart-notice' ) && (
					<AsyncLoad require="my-sites/current-site/stale-cart-items-notice" placeholder={ null } />
				) }
				{ isEnabled( 'current-site/notice' ) && (
					<AsyncLoad
						require="my-sites/current-site/notice"
						placeholder={ null }
						site={ selectedSite }
					/>
				) }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		anySiteSelected: getSelectedOrAllSites( state ),
		siteCount: getCurrentUserSiteCount( state ),
		hasAllSitesList: hasAllSitesList( state ),
	} ),
	{ recordGoogleEvent, setLayoutFocus }
)( localize( CurrentSite ) );
