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
import Button from 'components/forms/form-button';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import { getAllSiteTypes } from 'lib/signup/site-type';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
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
			otherValue: '',
			siteType: props.siteType,
		};
	}

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
		const fieldValue = this.state.otherValue ? 'other—' + this.state.otherValue : 'other–other';

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
			value: 'other',
		} );

		this.handleSubmit( fieldValue );
	};

	renderBasicCard = () => {
		return (
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
					</Card>
				) ) }
			</Card>
		);
	};

	renderOtherInfo = () => {
		const { translate } = this.props;

		return (
			<div className="site-type__other-option">
				<p className="site-type__other-label">{ translate( 'Or type your own' ) }</p>

				<div className="site-type__other-form">
					<FormTextInput
						className="site-type__other-input"
						selectOnFocus
						placeholder={ translate( 'Other' ) }
						onChange={ this.onOtherCatChange }
						value={ this.state.otherValue }
					/>

					<Button
						className="site-type__other-submit"
						disabled={ false }
						onClick={ this.handleSubmitOther }
					>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</div>
		);
	};

	render() {
		const { isJetpack } = this.props;

		if ( ! isJetpack ) {
			return <Fragment> { this.renderBasicCard() } </Fragment>;
		}

		return (
			<Fragment>
				{ this.renderBasicCard() }
				{ this.renderOtherInfo() }
			</Fragment>
		);
	}
}

export default connect(
	state => ( {
		isJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( SiteTypeForm ) );
