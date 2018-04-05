/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:application-passwords' );
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
/* eslint-disable no-restricted-imports */
import observe from 'lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */
import AppPasswordItem from 'me/application-password-item';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Gridicon from 'gridicons';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormSectionHeading from 'components/forms/form-section-heading';
import Card from 'components/card';
import classNames from 'classnames';
import QueryApplicationPasswords from 'components/data/query-application-passwords';
import {
	clearNewApplicationPassword,
	createApplicationPassword,
} from 'state/application-passwords/actions';
import { getApplicationPasswords, getNewApplicationPassword } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

const ApplicationPasswords = createReactClass( {
	displayName: 'ApplicationPasswords',
	mixins: [ observe( 'appPasswordsData' ) ],

	componentDidMount: function() {
		debug( this.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.displayName + ' React component is unmounting.' );
	},

	getInitialState: function() {
		return {
			applicationName: '',
			addingPassword: false,
			submittingForm: false,
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.state.submittingForm && ! this.props.newAppPassword && !! nextProps.newAppPassword ) {
			this.setState( { submittingForm: false } );
		}
	},

	getClickHandler( action, callback ) {
		return event => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	},

	handleApplicationNameFocus() {
		this.props.recordGoogleEvent( 'Me', 'Focused on Application Name Field' );
	},

	createApplicationPassword: function( event ) {
		event.preventDefault();
		this.setState( { submittingForm: true } );

		this.props.createApplicationPassword( this.state.applicationName );
	},

	clearNewApplicationPassword: function() {
		this.props.clearNewApplicationPassword();
		this.setState( this.getInitialState() );
	},

	toggleNewPassword: function( e ) {
		e.preventDefault();
		this.setState( { addingPassword: ! this.state.addingPassword } );
	},

	renderNewAppPasswordForm: function() {
		const { appPasswords } = this.props;
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
						<FormLabel htmlFor="application-name">
							{ this.props.translate( 'Application Name' ) }
						</FormLabel>
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
								? this.props.translate( 'Generating Password…' )
								: this.props.translate( 'Generate Password' ) }
						</FormButton>
						{ appPasswords.length ? (
							<FormButton
								isPrimary={ false }
								onClick={ this.getClickHandler(
									'Cancel Generate New Application Password Button',
									this.toggleNewPassword
								) }
							>
								{ this.props.translate( 'Cancel' ) }
							</FormButton>
						) : null }
					</FormButtonsBar>
				</form>
			</Card>
		);
	},

	renderNewAppPassword: function() {
		const { newAppPassword } = this.props;
		return (
			<Card className="application-passwords__new-password">
				<p className="application-passwords__new-password-display">{ newAppPassword }</p>

				<p className="application-passwords__new-password-help">
					{ this.props.translate(
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
						{ this.props.translate( 'Done' ) }
					</FormButton>
				</FormButtonsBar>
			</Card>
		);
	},

	renderApplicationPasswords: function() {
		const { appPasswords } = this.props;
		if ( ! appPasswords.length ) {
			return null;
		}

		return (
			<div className="application-passwords__active">
				<FormSectionHeading>{ this.props.translate( 'Active Passwords' ) }</FormSectionHeading>
				<ul className="application-passwords__list">
					{ appPasswords.map( function( password ) {
						return <AppPasswordItem password={ password } key={ password.ID } />;
					}, this ) }
				</ul>
			</div>
		);
	},

	render: function() {
		const { newAppPassword } = this.props;

		return (
			<div>
				<QueryApplicationPasswords />

				<SectionHeader label={ this.props.translate( 'Application Passwords' ) }>
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
						{ this.props.translate( 'Add New Application Password' ) }
					</Button>
				</SectionHeader>
				<Card>
					{ newAppPassword ? this.renderNewAppPassword() : this.renderNewAppPasswordForm() }

					<p>
						{ this.props.translate(
							'With Two-Step Authentication active, you can generate a custom password for ' +
								'each third-party application you authorize to use your WordPress.com account. ' +
								'You can revoke access for an individual application here if you ever need to.'
						) }
					</p>

					{ this.renderApplicationPasswords() }
				</Card>
			</div>
		);
	},

	handleChange( e ) {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	},
} );

export default connect(
	state => ( {
		appPasswords: getApplicationPasswords( state ),
		newAppPassword: getNewApplicationPassword( state ),
	} ),
	{
		clearNewApplicationPassword,
		createApplicationPassword,
		recordGoogleEvent,
	}
)( localize( ApplicationPasswords ) );
