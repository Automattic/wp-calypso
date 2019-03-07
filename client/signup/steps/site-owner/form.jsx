/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class SiteOwnerForm extends Component {
	static propTypes = {
		siteOwner: PropTypes.string,
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			siteOwner: props.siteOwner,
		};
	}

	handleRadioChange = event => this.setState( { siteOwner: event.currentTarget.value } );

	handleSubmit = event => {
		const { siteOwner } = this.state;

		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_owner', {
			value: siteOwner,
		} );

		this.props.submitForm( siteOwner );
	};

	renderRadioOptions() {
		const { translate } = this.props;

		const ownersQuestions = [
			{
				slug: 'true',
				label: translate( 'Myself' ),
			},
			{
				slug: 'false',
				label: translate( 'Someone else' ),
			},
		];
		return ownersQuestions.map( siteOwnerProperties => (
			<FormLabel
				className={ classNames( 'site-owner__option', {
					'is-selected': siteOwnerProperties.slug === this.state.siteOwner,
				} ) }
				key={ siteOwnerProperties.id }
			>
				<FormRadio
					value={ siteOwnerProperties.slug }
					checked={ siteOwnerProperties.slug === this.state.siteOwner }
					onChange={ this.handleRadioChange }
				/>
				<strong className="site-owner__option-label">{ siteOwnerProperties.label }</strong>
				<span className="site-owner__option-description">{ siteOwnerProperties.description }</span>
			</FormLabel>
		) );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="site-owner__wrapper">
				<form onSubmit={ this.handleSubmit }>
					<Card>
						<FormFieldset>{ this.renderRadioOptions() }</FormFieldset>
						<Button primary={ true } type="submit" disabled={ ! this.state.siteOwner }>
							{ translate( 'Continue' ) }
						</Button>
					</Card>
				</form>
			</div>
		);
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( SiteOwnerForm ) );
