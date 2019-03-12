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
import Gridicon from 'gridicons';

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

	handleRadioChange = event => this.setState( { siteType: event.currentTarget.value } );

	handleSubmit = event => {
		const { siteType } = this.state;

		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
			value: siteType,
		} );

		this.props.submitForm( siteType );
	};

	renderRadioOptions() {
		return getAllSiteTypes().map( siteTypeProperties => (
			<div className="site-type__option" key={ siteTypeProperties.id }>
				<strong className="site-type__option-label">{ siteTypeProperties.label }</strong>
				<span className="site-type__option-description">{ siteTypeProperties.description }</span>
				<Gridicon icon="chevron-right" />
			</div>
		) );
	}

	render() {
		return (
			<div className="site-type__wrapper">
				<Card>{ this.renderRadioOptions() }</Card>
			</div>
		);
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( SiteTypeForm ) );
