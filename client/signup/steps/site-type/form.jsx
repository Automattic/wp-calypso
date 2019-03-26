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
import Button from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { getAllSiteTypes } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTypeForm extends Component {
	static propTypes = {
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	state = {
		otherValue: '',
		siteType: '',
		hasOtherReasonFocus: false,
	};

	onOtherCatChange = event => {
		this.setState( {
			otherValue: event.target.value,
		} );
	};

	handleSubmit = type => {
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
			value: type,
		} );

		this.setState( { siteType: type } );

		this.props.submitForm( type );
	};

	handleSubmitOther = () => {
		if ( ! this.state.otherValue || this.state.hasOtherReasonFocus ) {
			return;
		}
		this.handleSubmit( 'other—' + this.state.otherValue );
	};

	setOtherReasonFocus = focus => () => {
		this.setState( { hasOtherReasonFocus: focus } );
	};

	render() {
		const { translate } = this.props;
		return (
			<div>
				<Card className="site-type__wrapper">
					{ getAllSiteTypes().map( siteTypeProperties => (
						<Card
							className="site-type__option"
							key={ siteTypeProperties.id }
							displayAsLink
							data-e2e-title={ siteTypeProperties.slug }
							onClick={ this.handleSubmit.bind( this, siteTypeProperties.slug ) }
						>
							<strong className="site-type__option-label">{ siteTypeProperties.label }</strong>
						</Card>
					) ) }
				</Card>
				<LoggedOutFormLinks className="site-type__links">
					<LoggedOutFormLinkItem className="site-type__text">
						Or type your own
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>

				<div className="site-type__other-link-item-form">
					<FormTextInput
						className="site-type__option-other"
						type="text"
						selectOnFocus
						placeholder={ translate( 'Site profile' ) }
						onChange={ this.onOtherCatChange }
						value={ this.state.otherValue }
					/>
					<Button
						className="site-type__other-submit"
						disabled={ false }
						onClick={ this.handleSubmitOther }
						compact
					>
						{ translate( 'Continue' ) }
					</Button>
				</div>
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
