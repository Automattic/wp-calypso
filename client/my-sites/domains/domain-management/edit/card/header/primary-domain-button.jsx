/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { domainManagementPrimaryDomain } from 'my-sites/domains/paths';
import { getDomainTypeText } from 'lib/domains';

class PrimaryDomainButton extends React.Component {
	handleClick = () => {
		this.props.makePrimaryClick( this.props.domain );
		page( domainManagementPrimaryDomain( this.props.selectedSite.slug, this.props.domain.name ) );
	};

	render() {
		const domain = this.props.domain;
		let label;

		if ( domain && ! domain.isPrimary ) {
			label = this.props.translate( 'Make Primary' );

			return (
				<Button compact onClick={ this.handleClick }>
					{ label }
				</Button>
			);
		}

		return null;
	}
}

const makePrimaryClick = domain => {
	const domainType = getDomainTypeText( domain );
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Make Primary" link on a ${ domainType } in Edit`,
			'Domain Name',
			domain.name
		)
	),
		recordTracksEvent( 'calypso_domain_management_edit_make_primary_click', {
			section: snakeCase( domainType ),
		} );
};

PrimaryDomainButton.propTypes = {
	domain: PropTypes.object.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
};

export default connect(
	null,
	{ makePrimaryClick }
)( localize( PrimaryDomainButton ) );
