/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import get from 'lodash/get';
import {
	getAuthorizationData,
	getAuthorizationRemoteSite
} from 'state/jetpack-connect/selectors';
import {
	authorize,
} from 'state/jetpack-connect/actions';
import { urlToSlug } from 'lib/url';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Internal dependencies
 */ 
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import JPOTextarea from './jpo-textarea';
import FormFieldset from 'components/forms/form-fieldset';
import formState from 'lib/form-state';
import Button from 'components/button';
import { translate } from 'i18n-calypso';
import { updateSettings } from 'state/jetpack/settings/actions';

import { setJPOSiteTitle } from 'state/signup/steps/jpo-site-title/actions';

const JPOSiteTitleStep = React.createClass( {
	errorMessage: '',

	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		jetpackConnectAuthorize: PropTypes.shape( {
			authorizeError: PropTypes.oneOfType( [
				PropTypes.object,
				PropTypes.bool,
			] ),
			authorizeSuccess: PropTypes.bool,
			isRedirectingToWpAdmin: PropTypes.bool,
			queryObject: PropTypes.shape( {
				already_authorized: PropTypes.bool,
				jp_version: PropTypes.string.isRequired,
				new_user_started_connection: PropTypes.bool,
				redirect_after_auth: PropTypes.string.isRequired,
				site: PropTypes.string.isRequired,
			} ).isRequired,
			siteReceived: PropTypes.bool,
		} ).isRequired,
	},

	getInitialState() {
		return {
			pluginsReady: 'no',
			settingsReady: 'no',
			widgetsReady: 'no',
		};
	},

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle', 'siteDescription' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: get( this.props.signupDependencies, [ 'jpoSiteTitle', 'siteTitle' ], '' )
				},
				siteDescription: {
					value: get( this.props.signupDependencies, [ 'jpoSiteTitle', 'siteDescription' ], '' )
				}
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},

	handleChangeEvent( event ) {
		if ( 'siteTitle' === event.target.name ) {
			this.setState( { siteTitleInvalid: false } );
		}

		if ( 'siteDescription' === event.target.name ) {
			this.setState( { siteDescriptionInvalid: false } );
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	getPayload() {
		return {
			siteTitle: formState.getFieldValue( this.state.form, 'siteTitle' ),
			siteDescription: formState.getFieldValue( this.state.form, 'siteDescription' )
		};
	},

	/**
	 * Save setting in Jetpack site
	 *
	 * @return {boolean}
	 */
	submitStep() {
		const jpoSiteTitle = this.getPayload();

		if ( ! jpoSiteTitle.siteTitle ) {
			this.errorMessage = 'Your site name and description is required.';
			this.setState( { siteTitleInvalid: true } );
		}

		if ( ! jpoSiteTitle.siteDescription ) {
			this.errorMessage = 'Your site name and description is required.';
			this.setState( { siteDescriptionInvalid: true } );
		}

		if ( ! ( jpoSiteTitle.siteTitle && jpoSiteTitle.siteDescription ) ) {
			return false;
		}

		this.props.setJPOSiteTitle( jpoSiteTitle );

		console.log( this.props.jetpackConnectAuthorize );
		const siteId = get( this.props.jetpackConnectAuthorize, [ 'queryObject', 'client_id' ], -1 );

		if ( 'no' === this.state.settingsReady ) {
			this.setState( { settingsReady: 'progress' } );
			this.props.updateSettings(
				siteId,
				{
					onboarding: {
						jpUser: get( this.props.jetpackConnectAuthorize, [ 'queryObject', 'user_email' ], -1 ),
						token: get( this.props.jetpackConnectAuthorize, [ 'queryObject', 'onboarding' ], -1 ),
						...jpoSiteTitle
					}
				},
				false // don't sanitize settings
			).then( () => this.setState( { settingsReady: 'yes' } ) );
		}

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: this.props.stepName,
			jpoSiteTitle
		}, [], { jpoSiteTitle } );

		this.props.goToNextStep();
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		const { siteTitle, siteDescription } = this.getPayload();
		return (
			<Card className="jpo__site-title-card">
				<FormFieldset>
					<FormLabel>{ translate( 'Site Title' ) }</FormLabel>
					<FormTextInput 
						isError={ this.state.siteTitleInvalid }
						className="jpo__site-title-input"
						name="siteTitle"
						onChange={ this.handleChangeEvent }
						value={ siteTitle }
					/>
					<FormLabel>{ translate( 'Site Description' ) }</FormLabel>
					<JPOTextarea
						isError={ this.state.siteDescriptionInvalid } 
						className="jpo__site-description-input" 
						name="siteDescription"
						onChange={ this.handleChangeEvent }
						value={ siteDescription }
					/>
					<FormLabel className="jpo__validation-error">{ this.errorMessage }</FormLabel>
					<Button primary onClick={ this.submitStep } className="jpo__site-title-submit">{ translate( 'Next Step' ) }</Button>
				</FormFieldset>
			</Card>
		);
	},

	render() {
		const headerText = translate( "Let's get started." );
		const subHeaderText = translate( 'First up, what would you like to name your site and have as its public description?' );

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderStepContent() }
					goToNextStep={ this.skipStep }
					shouldHideNavButtons={ true }
				/>
			</div>
		);
	}
} );

export default connect(
	state => {
		const remoteSiteUrl = getAuthorizationRemoteSite( state );
		const siteSlug = urlToSlug( remoteSiteUrl );
		return {
			jetpackConnectAuthorize: getAuthorizationData( state ),
			siteSlug,
			user: getCurrentUser( state )
		};
	},
	{
		setJPOSiteTitle,
		authorize,
		updateSettings,
	}
)( JPOSiteTitleStep );
