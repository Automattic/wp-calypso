/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
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

	constructor( props ) {
		super( props );
		this.state = {
			siteType: props.siteType,
		};
	}

	handleSubmit = type => {
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
			value: type,
		} );

		this.setState( { siteType: type } );

		this.props.submitForm( type );
	};

	renderSegmentOptions() {
		return getAllSiteTypes().map( siteTypeProperties => (
			<Card
				className="site-type__option"
				key={ siteTypeProperties.id }
				displayAsLink
				tagName="button"
				onClick={ this.handleSubmit.bind( this, siteTypeProperties.slug ) }
			>
				<strong className="site-type__option-label">{ siteTypeProperties.label }</strong>
				<span className="site-type__option-description">{ siteTypeProperties.description }</span>
			</Card>
		) );
	}

	render() {
		return <Card className="site-type__wrapper">{ this.renderSegmentOptions() }</Card>;
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( SiteTypeForm ) );
