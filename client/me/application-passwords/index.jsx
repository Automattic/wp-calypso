/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppPasswordItem from 'me/application-password-item';
import { Button, Card } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormTextInput from 'components/forms/form-text-input';
import QueryApplicationPasswords from 'components/data/query-application-passwords';
import SectionHeader from 'components/section-header';
import {
	clearNewApplicationPassword,
	createApplicationPassword,
} from 'state/application-passwords/actions';
import getApplicationPasswords from 'state/selectors/get-application-passwords';
import getNewApplicationPassword from 'state/selectors/get-new-application-password';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';
class ApplicationPasswords extends Component {
	static initialState = Object.freeze( {
		applicationName: '',
		addingPassword: false,
		submittingForm: false,
	} );

	state = this.constructor.initialState;

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.state.submittingForm && ! this.props.newAppPassword && !! nextProps.newAppPassword ) {
			this.setState( { submittingForm: false } );
		}
	}

	getClickHandler = ( action, callback ) => {
		return ( event ) => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	};

	handleApplicationNameFocus = () => {
		this.props.recordGoogleEvent( 'Me', 'Focused on Application Name Field' );
	};

	createApplicationPassword = ( event ) => {
		event.preventDefault();
		this.setState( { submittingForm: true } );
		this.props.createApplicationPassword( this.state.applicationName );
	};

	clearNewApplicationPassword = () => {
		this.props.clearNewApplicationPassword();
		this.setState( this.constructor.initialState );
	};

	toggleNewPassword = ( event ) => {
		event.preventDefault();
		this.setState( { addingPassword: ! this.state.addingPassword } );
	};

	handleChange = ( event ) => {
		const { name, value } = event.currentTarget;
		this.setState( { [ name ]: value } );
	};

	renderNewAppPasswordForm() {
		const { appPasswords, translate } = this.props;
		const cardClasses = classNames( 'application-passwords__add-new-card', {
			'is-visible': this.state.addingPassword,
		} );

		return (
			<Card className={ cardClasses }>
				<form
					id="add-application-password"
					className="application-passwords__add-new"
					onSubmit={ this.createApplicationPassword }
				>
					<FormFieldset>
						<FormLabel htmlFor="application-name">{ translate( 'Application Name' ) }</FormLabel>
						<FormTextInput
							className="application-passwords__add-new-field"
							disabled={ this.state.submittingForm }
							id="application-name"
							name="applicationName"
							onFocus={ this.handleApplicationNameFocus }
							value={ this.state.applicationName }
							onChange={ this.handleChange }
						/>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton
							disabled={ this.state.submittingForm || '' === this.state.applicationName }
							onClick={ this.getClickHandler( 'Generate New Application Password Button' ) }
						>
							{ this.state.submittingForm
								? translate( 'Generating Password…' )
								: translate( 'Generate Password' ) }
						</FormButton>
						{ appPasswords.length ? (
							<FormButton
								isPrimary={ false }
								onClick={ this.getClickHandler(
									'Cancel Generate New Application Password Button',
									this.toggleNewPassword
								) }
							>
								{ translate( 'Cancel' ) }
							</FormButton>
						) : null }
					</FormButtonsBar>
				</form>
			</Card>
		);
	}

	renderNewAppPassword() {
		const { newAppPassword, translate } = this.props;
		return (
			<Card className="application-passwords__new-password">
				<p className="application-passwords__new-password-display">{ newAppPassword }</p>

				<p className="application-passwords__new-password-help">
					{ translate(
						'Use this password to log in to {{strong}}%(appName)s{{/strong}}. Note: spaces are ignored.',
						{
							args: {
								appName: this.state.applicationName,
							},
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>

				<FormButtonsBar>
					<FormButton
						onClick={ this.getClickHandler(
							'New Application Password Done Button',
							this.clearNewApplicationPassword
						) }
					>
						{ translate( 'Done' ) }
					</FormButton>
				</FormButtonsBar>
			</Card>
		);
	}

	renderApplicationPasswords() {
		const { appPasswords, translate } = this.props;
		if ( ! appPasswords.length ) {
			return null;
		}

		return (
			<div className="application-passwords__active">
				<FormSectionHeading>{ translate( 'Active Passwords' ) }</FormSectionHeading>
				<ul className="application-passwords__list">
					{ appPasswords.map( ( password ) => (
						<AppPasswordItem password={ password } key={ password.ID } />
					) ) }
				</ul>
			</div>
		);
	}

	render() {
		const { newAppPassword, translate } = this.props;

		return (
			<Fragment>
				<QueryApplicationPasswords />

				<SectionHeader label={ translate( 'Application Passwords' ) }>
					{ ! newAppPassword && (
						<Button
							compact
							onClick={ this.getClickHandler(
								'Create Application Password Button',
								this.toggleNewPassword
							) }
						>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon="plus-small" size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							{ translate( 'Add new application password' ) }
						</Button>
					) }
				</SectionHeader>
				<Card>
					{ newAppPassword ? this.renderNewAppPassword() : this.renderNewAppPasswordForm() }

					<p className="application-passwords__nobot">
						{ translate(
							'With Two-Step Authentication active, you can generate a custom password for ' +
								'each third-party application you authorize to use your WordPress.com account. ' +
								'You can revoke access for an individual application here if you ever need to.'
						) }
					</p>

					{ this.renderApplicationPasswords() }
				</Card>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		appPasswords: getApplicationPasswords( state ),
		newAppPassword: getNewApplicationPassword( state ),
	} ),
	{
		clearNewApplicationPassword,
		createApplicationPassword,
		recordGoogleEvent,
	}
)( localize( ApplicationPasswords ) );
