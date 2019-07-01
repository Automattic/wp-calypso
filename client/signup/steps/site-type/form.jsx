/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import Card from 'components/card';
import { getAllSiteTypes } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTypeForm extends Component {
	static propTypes = {
		siteType: PropTypes.string,
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	handleSubmit = type => {
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
			value: type,
		} );
		this.props.submitForm( type );
	};

	render() {
		return (
			<Fragment>
				<Card className="site-type__wrapper">
					{ getAllSiteTypes().map( siteTypeProperties => (
						<Card
							className="site-type__option"
							key={ siteTypeProperties.id }
							tagName="button"
							displayAsLink
							data-e2e-title={ siteTypeProperties.slug }
							onClick={ this.handleSubmit.bind( this, siteTypeProperties.slug ) }
						>
							<strong className="site-type__option-label">{ siteTypeProperties.label }</strong>
							<span className="site-type__option-description">
								{ siteTypeProperties.description }
							</span>
							{ siteTypeProperties.purchaseRequired && (
								<Badge className="site-type__option-badge" type="info">
									{ this.props.translate( 'Purchase required' ) }
								</Badge>
							) }
						</Card>
					) ) }
				</Card>
			</Fragment>
		);
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( SiteTypeForm ) );
