/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import analyticsMixin from 'lib/mixins/analytics';
import paths from 'my-sites/domains/paths';

const PrimaryDomainButton = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	propTypes: {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		settingPrimaryDomain: PropTypes.bool.isRequired
	},

	handleClick() {
		this.recordEvent( 'makePrimaryClick', this.props.domain );

		page( paths.domainManagementPrimaryDomain( this.props.selectedSite.slug, this.props.domain.name ) );
	},

	render() {
		const domain = this.props.domain;
		let label;

		if ( domain && ! domain.isPrimary ) {
			if ( this.props.settingPrimaryDomain ) {
				label = this.props.translate( 'Saving…' );
			} else {
				label = this.props.translate( 'Make Primary' );
			}

			return (
				<Button
					compact
					className="domain-details-card__make-primary-button"
					onClick={ this.handleClick }>
					{ label }
				</Button>
			);
		}

		return null;
	}
} );

export default localize( PrimaryDomainButton );
