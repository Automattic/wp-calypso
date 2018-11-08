/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import EmailValidator from 'email-validator';
import { connect } from 'react-redux';
import { invoke } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */

import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';
import Button from 'components/button';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';
import HeroImage from './hero-image';

/**
 * Style dependencies
 */
import './style.scss';

class PressableStoreStep extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			email: '',
			isValid: false,
			error: null,
		};
	}

	static propTypes = {
		isVisible: PropTypes.bool,
	};

	static defaultProps = {
		isVisible: false,
	};

	componentDidMount() {
		this.props.setRef( this );
	}

	focus = () => {
		invoke( this, 'input.focus' );
	};

	onEmailChange = ( { target: { value: email } } ) => {
		const isValid = EmailValidator.validate( email );
		const error = this.state.error && isValid ? null : this.state.error;
		this.setState( {
			email,
			isValid,
			error,
		} );
	};

	onSubmit = event => {
		event.preventDefault();

		if ( ! this.state.isValid ) {
			this.setState( {
				error: this.props.translate( 'Please provide a valid email address.' ),
			} );
			return;
		}

		this.props.partnerClickRecorder();

		window.open(
			`https://my.pressable.com/signup/ecommerce-five-sites?email=${ encodeURIComponent(
				this.state.email
			) }&utm_source=wordpresscom&utm_medium=signupref&utm_campaign=wpcomecomm3`
		);
	};

	onEmailInputRef = input => {
		this.input = input;
	};

	getTabIndex() {
		const { isVisible } = this.props;

		if ( isVisible ) {
			return 1;
		}

		return -1;
	}

	renderStoreForm() {
		const { translate } = this.props;

		return (
			<div>
				<LoggedOutForm className="pressable-store__form" onSubmit={ this.onSubmit }>
					<HeroImage />

					<FormSectionHeading className="pressable-store__heading">
						{ translate( 'Get your store for as low as %(price)s / month', {
							args: { price: '$25' },
						} ) }
					</FormSectionHeading>
					<p className="pressable-store__copy">
						{ translate(
							"We've partnered with Pressable, a top-notch WordPress hosting provider," +
								' and WooCommerce, the go-to eCommerce solution for WordPress, to make setting up ' +
								'your store a snap.'
						) }
					</p>

					<LoggedOutFormFooter>
						<FormLabel className="pressable-store__form-label" htmlFor="email">
							{ translate( 'Start by entering your email address:' ) }
						</FormLabel>
						<div className="pressable-store__form-fields">
							<FormTextInput
								ref={ this.onEmailInputRef }
								isError={ this.state.error }
								isValid={ this.state.isValid }
								onChange={ this.onEmailChange }
								className="pressable-store__form-email is-spaced"
								type="email"
								placeholder="Email Address"
								name="email"
								tabIndex={ this.getTabIndex() }
							/>
							<FormButton className="pressable-store__form-submit" tabIndex={ this.getTabIndex() }>
								{ translate( 'Get started on Pressable' ) }
								<Gridicon icon="external" size={ 12 } />
							</FormButton>
						</div>
						{ this.state.error && (
							<FormInputValidation isError={ true } text={ this.state.error } />
						) }
					</LoggedOutFormFooter>
				</LoggedOutForm>
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem
						className="pressable-store__privacy-policy"
						target="__blank"
						href="https://pressable.com/legal/privacy-policy/"
						tabIndex={ this.getTabIndex() }
					>
						{ translate( 'Pressable Privacy Policy', {
							comment: '“Pressable” is the name of a WordPress.org hosting provider',
						} ) }
						<Gridicon icon="external" size={ 12 } />
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</div>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="pressable-store">
				{ this.renderStoreForm() }
				<div className="pressable-store__back-button-wrapper">
					<Button
						compact={ true }
						borderless={ true }
						onClick={ this.props.onBackClick }
						tabIndex={ this.getTabIndex() }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Back', { context: 'Return to previous step' } ) }
					</Button>
				</div>
			</div>
		);
	}
}

PressableStoreStep.propTypes = {
	onBackClick: PropTypes.func.isRequired,
	setRef: PropTypes.func,
};

const mapDispatchToProps = dispatch => ( {
	partnerClickRecorder: () =>
		dispatch(
			recordTracksEvent( 'calypso_triforce_partner_redirect', { partner_name: 'Pressable' } )
		),
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( PressableStoreStep ) );
