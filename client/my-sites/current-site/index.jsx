import { isEnabled } from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import { localize, withRtl } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

class CurrentSite extends Component {
	static propTypes = {
		siteCount: PropTypes.number.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		anySiteSelected: PropTypes.array,
		forceAllSitesView: PropTypes.bool,
		isRtl: PropTypes.bool,
	};

	switchSites = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );
		this.props.recordTracksEvent( 'calypso_switch_site_click' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	render() {
		const { selectedSite, translate } = this.props;
		const arrowDirection = this.props.isRtl ? 'right' : 'left';

		return (
			<Card className="current-site">
				<div role="button" tabIndex="0" aria-hidden="true" onClick={ this.expandUnifiedNavSidebar }>
					{ selectedSite && isEnabled( 'current-site/domain-warning' ) && (
						<AsyncLoad
							require="calypso/my-sites/current-site/domain-warnings"
							placeholder={ null }
						/>
					) }
					{ selectedSite && isEnabled( 'current-site/stale-cart-notice' ) && (
						<CalypsoShoppingCartProvider>
							<AsyncLoad
								require="calypso/my-sites/current-site/stale-cart-items-notice"
								placeholder={ null }
							/>
						</CalypsoShoppingCartProvider>
					) }
					{ selectedSite && isEnabled( 'current-site/notice' ) && (
						<AsyncLoad
							require="calypso/my-sites/current-site/notice"
							placeholder={ null }
							site={ selectedSite }
						/>
					) }
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		selectedSite: ownProps.forceAllSitesView ? null : getSelectedSite( state ),
		anySiteSelected: getSelectedOrAllSites( state ),
		siteCount: getCurrentUserSiteCount( state ),
		hasAllSitesList: hasAllSitesList( state ),
	} ),
	{
		recordGoogleEvent,
		recordTracksEvent,
		setLayoutFocus,
		savePreference,
	}
)( withRtl( localize( CurrentSite ) ) );
