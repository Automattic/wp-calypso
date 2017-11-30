/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import TransferSiteToUserWarning from './warning';

class TransferSiteToUser extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			warningAcknowledged: false,
		};

		this.renderBody = this.renderBody.bind( this );
		this.renderWarning = this.renderWarning.bind( this );
		this.acknowlegeWarning = this.acknowlegeWarning.bind( this );
	}

	renderBody() {
		if ( ! this.state.warningAcknowledged ) {
			return this.renderWarning();
		}
	}

	renderWarning() {
		return <TransferSiteToUserWarning onAcknowledged={ this.acknowlegeWarning } />;
	}

	acknowlegeWarning() {
		this.setState( { warningAcknowledged: true } );
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
	};
} )( localize( TransferSiteToUser ) );
