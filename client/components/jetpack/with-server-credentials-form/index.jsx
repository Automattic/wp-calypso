/**
 * External dependendies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteCredentials, updateCredentials } from 'calypso/state/jetpack/credentials/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';

const INITIAL_FORM_STATE = {
	protocol: 'ssh',
	host: '',
	port: 22,
	user: '',
	pass: '',
	path: '',
	kpri: '',
};

function mergeFormWithCredentials( form, credentials, siteSlug ) {
	const newForm = Object.assign( {}, form );
	// Replace empty fields with what comes from the state.
	if ( credentials ) {
		newForm.protocol = credentials.protocol || newForm.protocol;
		newForm.host = credentials.host || newForm.host;
		newForm.port = credentials.port || newForm.port;
		newForm.user = credentials.user || newForm.user;
		newForm.path = credentials.abspath || newForm.path;
	}
	// Populate the host field with the site slug if needed
	newForm.host = isEmpty( newForm.host ) && siteSlug ? siteSlug.split( '::' )[ 0 ] : newForm.host;
	return newForm;
}

function withServerCredentialsForm( WrappedComponent ) {
	const ServerCredentialsFormClass = class ServerCredentialsForm extends Component {
		static propTypes = {
			role: PropTypes.string.isRequired,
			siteId: PropTypes.number,
			siteUrl: PropTypes.string,
			requirePath: PropTypes.bool,
			formIsSubmitting: PropTypes.bool,
			formSubmissionStatus: PropTypes.string,
		};

		static defaultProps = {
			requirePath: false,
		};

		constructor( props ) {
			super( props );
			const { credentials, siteSlug } = props;
			const form = Object.assign( {}, INITIAL_FORM_STATE );

			this.state = {
				form: mergeFormWithCredentials( form, credentials, siteSlug ),
				formErrors: {
					host: false,
					port: false,
					user: false,
					pass: false,
					path: false,
				},
				showAdvancedSettings: false,
			};
		}

		handleFieldChange = ( { target: { name, value } } ) => {
			const changedProtocol = 'protocol' === name;
			const defaultPort = 'ftp' === value ? 21 : 22;

			const form = Object.assign(
				this.state.form,
				{ [ name ]: value },
				changedProtocol && { port: defaultPort }
			);

			this.setState( {
				form,
				formErrors: { ...this.state.formErrors, [ name ]: false },
			} );
		};

		handleSubmit = () => {
			const { requirePath, role, siteId, siteUrl } = this.props;

			const payload = {
				role,
				site_url: siteUrl,
				...this.state.form,
			};

			let userError = '';

			if ( ! payload.user ) {
				userError = translate( 'Please enter your server username.' );
			} else if ( 'root' === payload.user ) {
				userError = translate(
					"We can't accept credentials for the root user. " +
						'Please provide or create credentials for another user with access to your server.'
				);
			}

			const errors = Object.assign(
				! payload.host && { host: translate( 'Please enter a valid server address.' ) },
				! payload.port && { port: translate( 'Please enter a valid server port.' ) },
				isNaN( payload.port ) && { port: translate( 'Port number must be numeric.' ) },
				userError && { user: userError },
				! payload.pass &&
					! payload.kpri && { pass: translate( 'Please enter your server password.' ) },
				! payload.path && requirePath && { path: translate( 'Please enter a server path.' ) }
			);

			return isEmpty( errors )
				? this.props.updateCredentials( siteId, payload )
				: this.setState( { formErrors: errors } );
		};

		handleDelete = () => this.props.deleteCredentials( this.props.siteId, this.props.role );

		toggleAdvancedSettings = () =>
			this.setState( { showAdvancedSettings: ! this.state.showAdvancedSettings } );

		UNSAFE_componentWillReceiveProps( nextProps ) {
			const { credentials, siteSlug } = nextProps;
			const siteHasChanged = this.props.siteId !== nextProps.siteId;
			const nextForm = Object.assign(
				{},
				siteHasChanged ? { ...INITIAL_FORM_STATE } : this.state.form
			);
			this.setState( { form: mergeFormWithCredentials( nextForm, credentials, siteSlug ) } );
		}

		render() {
			const { form, formErrors, showAdvancedSettings } = this.state;
			const {
				formIsSubmitting,
				formSubmissionStatus,
				requirePath,
				siteId,
				...otherProps
			} = this.props;
			return (
				<>
					<QuerySiteCredentials siteId={ siteId } />
					<WrappedComponent
						form={ form }
						formErrors={ formErrors }
						formIsSubmitting={ formIsSubmitting }
						formSubmissionStatus={ formSubmissionStatus }
						requirePath={ requirePath }
						handleFieldChange={ this.handleFieldChange }
						handleSubmit={ this.handleSubmit }
						handleDelete={ this.handleDelete }
						showAdvancedSettings={ showAdvancedSettings }
						toggleAdvancedSettings={ this.toggleAdvancedSettings }
						{ ...otherProps }
					/>
				</>
			);
		}
	};

	const mapStateToProps = ( state, { siteId, role } ) => {
		const formSubmissionStatus = getJetpackCredentialsUpdateStatus( state, siteId );
		return {
			formSubmissionStatus,
			formIsSubmitting: 'pending' === formSubmissionStatus,
			siteSlug: getSiteSlug( state, siteId ),
			credentials: getJetpackCredentials( state, siteId, role ),
		};
	};

	return connect( mapStateToProps, { deleteCredentials, updateCredentials } )(
		ServerCredentialsFormClass
	);
}

export default withServerCredentialsForm;
