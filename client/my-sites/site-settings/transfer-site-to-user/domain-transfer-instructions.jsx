/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ActionPanel from 'my-sites/site-settings/action-panel';
import ActionPanelTitle from 'my-sites/site-settings/action-panel/title';
import ActionPanelBody from 'my-sites/site-settings/action-panel/body';
import ActionPanelFooter from 'my-sites/site-settings/action-panel/footer';
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteDomain } from 'state/sites/selectors';

class DomainTransferInstructions extends PureComponent {
	static propTypes = {
		selectedSiteDomain: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const translate = this.props.translate;

		return (
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelTitle>{ translate( 'Your Site Has A Domain' ) }</ActionPanelTitle>
					<p>{ translate( 'You must transfer your domain first!' ) }</p>
				</ActionPanelBody>
				<ActionPanelFooter>
					<Button className="transfer-site-to-user__cancel is-scary">
						<Gridicon icon="cross" size={ 48 } />
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="transfer-site-to-user__continue">
						{ translate( 'Transfer Your Domain' ) }
						<Gridicon icon="chevron-right" size={ 48 } />
					</Button>
				</ActionPanelFooter>
			</ActionPanel>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		selectedSiteDomain: getSiteDomain( state, siteId ),
	};
} )( localize( DomainTransferInstructions ) );
