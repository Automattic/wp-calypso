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
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSegments } from 'state/signup/segments/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTypeForm extends Component {
	static propTypes = {
		siteType: PropTypes.string,
		submitForm: PropTypes.func.isRequired,
		segments: PropTypes.array,
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

	handleSubmit = ( { slug, theme } ) => {
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
			value: slug,
			user_input_site_type: this.state.otherValue || null,
		} );

		this.setState( { siteType: slug } );

		this.props.submitForm( slug === 'other' ? slug + '-' + this.state.otherValue : slug, theme );
	};

	handleSubmitOther = () => this.handleSubmit( 'other' );

	renderBasicCard = () => {
		return (
			<Card className="site-type__wrapper">
				{ this.props.segments &&
					this.props.segments.map( siteTypeProperties => (
						<Card
							className="site-type__option"
							key={ siteTypeProperties.id }
							tagName="button"
							displayAsLink
							data-e2e-title={ siteTypeProperties.slug }
							onClick={ this.handleSubmit.bind( this, siteTypeProperties ) }
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
				{
					// TODO Insert <QuerySegments /> here in case we land on this step
					// and for any reason the segments haven't been fetched
				 }
			</div>
		);
	};

	render() {
		const { isJetpack } = this.props;

		return (
			<Fragment>
				{ this.renderBasicCard() }
				{ isJetpack && this.renderOtherInfo() }
			</Fragment>
		);
	}
}

export default connect(
	state => ( {
		isJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
		segments: getSegments( state ) || [],
	} ),
	{
		recordTracksEvent,
	}
)( localize( SiteTypeForm ) );
