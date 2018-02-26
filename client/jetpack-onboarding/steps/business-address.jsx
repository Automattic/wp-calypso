/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get, map, omit, reduce, some } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ConnectSuccess from '../connect-success';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import JetpackLogo from 'components/jetpack-logo';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySites from 'components/data/query-sites';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { addQueryArgs } from 'lib/route';
import { getUnconnectedSiteUrl } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingBusinessAddressStep extends React.PureComponent {
	static emptyFields = {
		city: '',
		name: '',
		state: '',
		street: '',
		zip: '',
		country: '',
	};

	state = {
		fields: get( this.props.settings, 'businessAddress' ) || this.constructor.emptyFields,
		wantsBusinessAddress: false,
	};

	componentDidUpdate() {
		this.maybeDisplayForm();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingSettings && ! nextProps.isRequestingSettings ) {
			this.setState( {
				fields: get( nextProps.settings, 'businessAddress' ) || this.constructor.emptyFields,
			} );
		}
	}

	maybeDisplayForm() {
		const { action, hasBusinessAddress, isConnected, isRequestingSettings } = this.props;

		if (
			! isRequestingSettings &&
			isConnected &&
			hasBusinessAddress === false &&
			action === 'add_business_address'
		) {
			this.displayForm();
		}
	}

	displayForm = () => {
		this.setState( {
			wantsBusinessAddress: true,
		} );
	};

	handleAddBusinessAddressClick = () => {
		this.props.recordJpoEvent( 'calypso_jpo_business_address_clicked' );

		if ( ! this.props.isConnected ) {
			return;
		}

		this.displayForm();
	};

	handleNextButtonClick = () => {
		this.props.recordJpoEvent( 'calypso_jpo_business_address_next_clicked' );
	};

	getChangeHandler = field => event => {
		this.setState( {
			fields: {
				...this.state.fields,
				[ field ]: event.target.value,
			},
		} );
	};

	fields = this.getFields();

	getFields() {
		const { translate } = this.props;

		return {
			name: translate( 'Business name' ),
			street: translate( 'Street address' ),
			city: translate( 'City' ),
			state: translate( 'State / Region / Province' ),
			zip: translate( 'ZIP code' ),
			country: translate( 'Country' ),
		};
	}

	handleSubmit = event => {
		event.preventDefault();
		if ( this.props.isRequestingSettings ) {
			return;
		}

		const { settings, siteId } = this.props;

		this.props.recordJpoEvent(
			'calypso_jpo_business_address_submitted',
			reduce(
				this.fields,
				( eventProps, value, field ) => {
					const changed =
						get( settings, [ 'businessAddress', field ] ) !== this.state.fields[ field ];
					eventProps[ `${ field }_changed` ] = changed;
					return eventProps;
				},
				{}
			)
		);

		this.props.saveJpoSettings( siteId, { businessAddress: this.state.fields } );
	};

	hasEmptyFields = () => {
		return some( omit( this.state.fields, 'state' ), val => val === '' );
	};

	renderHeader() {
		const { translate } = this.props;
		const headerText = translate( 'Help your customers find you with Jetpack.' );
		const subHeaderText = translate(
			"Add your business address and a map of your location with Jetpack's business address widget. " +
				"You can adjust the widget's location later."
		);

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}

	renderActionTile() {
		const { isConnected, siteUrl, translate } = this.props;

		const connectUrl = addQueryArgs(
			{
				url: siteUrl,
				// TODO: add a parameter to the JPC to redirect back to this step after completion
				// and in the redirect URL include the ?action=add_business_address parameter
				// to actually trigger the form display action after getting back to JPO
			},
			'/jetpack/connect'
		);
		const href = ! isConnected ? connectUrl : null;

		return (
			<Fragment>
				{ this.renderHeader() }

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Add a business address' ) }
						image="/calypso/images/illustrations/illustration-layout.svg"
						onClick={ this.handleAddBusinessAddressClick }
						href={ href }
					/>
				</TileGrid>
			</Fragment>
		);
	}

	renderForm() {
		const { isRequestingSettings, translate } = this.props;

		return (
			<Fragment>
				{ this.renderHeader() }

				<Card className="steps__form">
					<form onSubmit={ this.handleSubmit }>
						{ map( this.fields, ( fieldLabel, fieldName ) => {
							const isValidatingField = ! isRequestingSettings && fieldName !== 'state';
							const isValidField = this.state.fields[ fieldName ] !== '';

							return (
								<FormFieldset key={ fieldName }>
									<FormLabel htmlFor={ fieldName }>{ fieldLabel }</FormLabel>
									<FormTextInput
										autoFocus={ fieldName === 'name' }
										disabled={ isRequestingSettings }
										id={ fieldName }
										isError={ isValidatingField && ! isValidField }
										isValid={ isValidatingField && isValidField }
										onChange={ this.getChangeHandler( fieldName ) }
										value={ this.state.fields[ fieldName ] || '' }
									/>
									{ isValidatingField &&
										! isValidField && (
											<FormInputValidation
												isError
												text={ translate( 'Please enter a %(fieldLabel)s', {
													args: { fieldLabel },
												} ) }
											/>
										) }
								</FormFieldset>
							);
						} ) }
						<Button
							disabled={ isRequestingSettings || this.hasEmptyFields() }
							primary
							type="submit"
						>
							{ translate( 'Add address' ) }
						</Button>
					</form>
				</Card>
			</Fragment>
		);
	}

	renderActionTileOrForm() {
		const { isConnected } = this.props;
		const { wantsBusinessAddress } = this.state;

		if ( wantsBusinessAddress && isConnected ) {
			return this.renderForm();
		}
		return this.renderActionTile();
	}

	render() {
		const { basePath, getForwardUrl, hasBusinessAddress, siteId, translate } = this.props;

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Business Address ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.BUSINESS_ADDRESS, ':site' ].join( '/' ) }
					title="Business Address ‹ Jetpack Start"
				/>
				<QuerySites siteId={ siteId } />

				<JetpackLogo full size={ 45 } />

				{ hasBusinessAddress ? (
					<ConnectSuccess
						href={ getForwardUrl() }
						illustration="/calypso/images/illustrations/illustration-layout.svg"
						onClick={ this.handleNextButtonClick }
						title={ translate( 'Success! Jetpack has added your business address to your site.' ) }
					/>
				) : (
					this.renderActionTileOrForm()
				) }
			</div>
		);
	}
}

export default connect( ( state, { settings, siteId } ) => ( {
	hasBusinessAddress: get( settings, 'businessAddress' ) !== false,
	isConnected: isJetpackSite( state, siteId ),
	siteUrl: getUnconnectedSiteUrl( state, siteId ),
} ) )( localize( JetpackOnboardingBusinessAddressStep ) );
