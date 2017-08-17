/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defaults, get, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getContactDetailsCache } from 'state/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';

const debug = debugFactory( 'calypso:domains:registrant-extra-info' );
let defaultRegistrantType;

// If we set a field to null, react decides it's uncontrolled and complains
// and we don't particularly want to make the parent remember all our fields
// so we use these values to plug missing.
const emptyValues = {
	registrantVatId: '',
	sirenSiret: '',
	trademarkNumber: '',
};

class RegistrantExtraInfoFrForm extends React.PureComponent {
	static propTypes = {
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
	}

	static defaultProps = {
		isVisible: true,
		onSubmit: noop,
	}

	componentWillMount() {
		// We're pushing props out into the global state here because:
		// 1) We want to use these values if the user navigates unexpectedly then returns
		// 2) We want to use the tld specific forms to manage the tld specific
		//    fields so we can keep them together in one place
		defaultRegistrantType = this.props.contactDetails.organization ? 'organization' : 'individual';

		this.props.updateContactDetailsCache( { extra: {
			registrantType: defaultRegistrantType
		} } );
	}

	handleChangeEvent = ( event ) => {
		debug( 'Setting ' + event.target.id + ' to ' + event.target.value );
		this.props.updateContactDetailsCache( {
			extra: { [ event.target.id ]: event.target.value },
		} );
	}

	render() {
		const translate = this.props.translate;
		const registrantType = get( this.props.contactDetails, 'extra.registrantType', defaultRegistrantType );
		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate(
						'Almost done! We need some extra details to register your %(tld)s domain.',
						{ args: { tld: '.fr' } }
					) }
				</p>
				<FormFieldset>
					<FormLegend>
						{ translate( "Who's this domain for?" ) }
					</FormLegend>
					<FormLabel>
						<FormRadio value="individual"
							id="registrantType"
							checked={ 'individual' === registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ translate( 'An individual' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio value="organization"
							id="registrantType"
							checked={ 'organization' === registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ translate( 'A company or organization' ) }</span>
					</FormLabel>
				</FormFieldset>

				{ 'organization' === registrantType && this.renderOrganizationFields() }

				{ this.props.children }
			</form>
		);
	}

	renderOrganizationFields() {
		const translate = this.props.translate;
		const { extra } = this.props.contactDetails;
		const {
			registrantVatId,
			sirenSiret,
			trademarkNumber
		} = defaults( {}, extra, emptyValues );

		return (
			<div>
				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional"
						htmlFor="registrantVatId">
						{ translate( 'VAT Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						id="registrantVatId"
						value={ registrantVatId }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ translate( 'ex. XX123456789' ) }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional"
						htmlFor="sirenSiret">
						{ translate( 'SIREN or SIRET Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						id="sirenSiret"
						value={ sirenSiret }
						placeholder={
							translate( 'ex. 123 456 789 or 123 456 789 01234',
								{ comment: 'ex is short for "example". The numbers are examples of the EU VAT format' }
							)
						}
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional"
						htmlFor="trademarkNumber">
						{ translate( 'EU Trademark Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						id="trademarkNumber"
						value={ trademarkNumber }
						type="number"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={
							translate( 'ex. 123456789',
								{ comment: 'ex is short for example. The number is the EU trademark number format.' }
							)
						}
						onChange={ this.handleChangeEvent } />
				</FormFieldset>
			</div>
		);
	}

	renderOptional() {
		return (
			<span className="registrant-extra-info__optional-label">{ this.props.translate( 'Optional' ) }</span>
		);
	}
}

export default connect(
	state => ( { contactDetails: getContactDetailsCache( state ) } ),
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoFrForm ) );
