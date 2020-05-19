/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { domainManagementPrimaryDomain } from 'my-sites/domains/paths';
import { getDomainTypeText } from 'lib/domains';

class PrimaryDomainButton extends React.Component {
	handleClick = () => {
		this.props.recordMakePrimaryClick( this.props.domain );
		page( domainManagementPrimaryDomain( this.props.selectedSite.slug, this.props.domain.name ) );
	};

	render() {
		const { domain, translate } = this.props;

		if ( domain && ! domain.isPrimary ) {
			return (
				<Button compact onClick={ this.handleClick }>
					{ translate( 'Make primary' ) }
				</Button>
			);
		}

		return null;
	}
}

const recordMakePrimaryClick = ( domain ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Make Primary" link on a ${ getDomainTypeText( domain ) } in Edit`,
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_edit_make_primary_click', {
			section: domain.type,
		} )
	);

PrimaryDomainButton.propTypes = {
	domain: PropTypes.object.isRequired,
	recordMakePrimaryClick: PropTypes.func.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { recordMakePrimaryClick } )( localize( PrimaryDomainButton ) );
