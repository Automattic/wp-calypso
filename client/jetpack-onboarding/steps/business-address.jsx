/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { every, get, map, reduce } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ConnectIntro from '../connect-intro';
import ConnectSuccess from '../connect-success';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import JetpackLogo from 'components/jetpack-logo';
import QuerySites from 'components/data/query-sites';
import { isJetpackSite } from 'state/sites/selectors';

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

	UNSAFE_componentWillReceiveProps( nextProps ) {
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

	isFormEmpty = () => {
		return every( this.state.fields, val => val === '' );
	};

	renderHeader() {
		const { translate } = this.props;
		const headerText = translate( 'Help your customers find you with Jetpack.' );
		const subHeaderText = translate(
			"Add your business address and a map of your location with Jetpack's business address widget. " +
				"You can edit the widget's content and position later."
		);

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}

	renderActionTile() {
		const { siteId, translate } = this.props;

		return (
			<ConnectIntro
				action="add_business_address"
				buttonLabel={ translate( 'Add a business address' ) }
				e2eType="business-address"
				header={ this.renderHeader() }
				illustration="/calypso/images/illustrations/jetpack-business-address.svg"
				onClick={ this.handleAddBusinessAddressClick }
				siteId={ siteId }
			/>
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
							return (
								<FormFieldset key={ fieldName }>
									<FormLabel htmlFor={ fieldName }>{ fieldLabel }</FormLabel>
									<FormTextInput
										autoFocus={ fieldName === 'name' }
										disabled={ isRequestingSettings }
										id={ fieldName }
										onChange={ this.getChangeHandler( fieldName ) }
										value={ this.state.fields[ fieldName ] || '' }
									/>
								</FormFieldset>
							);
						} ) }
						<Button disabled={ isRequestingSettings || this.isFormEmpty() } primary type="submit">
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
		const { getForwardUrl, hasBusinessAddress, siteId, translate } = this.props;

		return (
			<div className="steps__main" data-e2e-type="business-address">
				<QuerySites siteId={ siteId } />

				<JetpackLogo full size={ 45 } />

				{ hasBusinessAddress ? (
					<ConnectSuccess
						href={ getForwardUrl() }
						illustration="/calypso/images/illustrations/jetpack-business-address.svg"
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
} ) )( localize( JetpackOnboardingBusinessAddressStep ) );
