/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import DomainTransferInstructions from './domain-transfer-instructions';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SiteTransferWarning from './site-transfer-warning';

class TransferSiteToUser extends React.Component {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		currentPlan: PropTypes.object,
		translate: PropTypes.func,
	};

	constructor( props ) {
		super( props );
		this.state = {
			warningAcknowledged: false,
		};

		this.renderBody = this.renderBody.bind( this );
		this.renderSiteTransferWarning = this.renderSiteTransferWarning.bind( this );
		this.acknowlegeWarning = this.acknowlegeWarning.bind( this );
		this.renderDomainTransferInstructions = this.renderDomainTransferInstructions.bind( this );
	}

	renderBody() {
		if ( ! this.state.warningAcknowledged ) {
			return this.renderSiteTransferWarning();
		}
		if ( this.props.currentPlan.isDomainUpgrade ) {
			return this.renderDomainTransferInstructions();
		}
	}

	renderSiteTransferWarning() {
		return <SiteTransferWarning onAcknowledged={ this.acknowlegeWarning } />;
	}

	acknowlegeWarning() {
		this.setState( { warningAcknowledged: true } );
	}

	renderDomainTransferInstructions() {
		return <DomainTransferInstructions />;
	}

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="transfer-site-to-user">
				<HeaderCake backHref={ '/settings/general/' + siteSlug }>
					<h1>{ translate( 'Transfer Your Site' ) }</h1>
				</HeaderCake>
				{ this.renderBody() }
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
		currentPlan: getCurrentPlan( state, siteId ),
	};
} )( localize( TransferSiteToUser ) );
