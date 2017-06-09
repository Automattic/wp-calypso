/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getContactDetailsCache } from 'state/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormCheckbox from 'components/forms/form-checkbox';

const defaultValues = {
	legalType: 'CCW',
	isVisible: true,
	agreementAccepted: false,
	onSubmit: noop,
};

class RegistrantExtraInfoCaForm extends React.PureComponent {
	static propTypes = {
		agreementAccepted: PropTypes.bool,
		legalType: PropTypes.string,
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
	}

	constructor( props ) {
		super( props );

		this.props.contactDetails.extra = {
			...defaultValues,
			...this.props.contactDetails.extra
		};
	}

	handleChangeEvent = ( event ) => {
		this.props.updateContactDetailsCache( {
			extra: { [ event.target.id ]: event.target.value },
		} );
	}

	render() {
		const {
			legalType,
			translate,
			ciraAccepted
		} = { ...defaultValues, ...this.props };
		const agreementUrl = 'https://services.cira.ca/agree/agreement/agreementVersion2.0.jsp';

		return (
			<form className="registrant-extra-info__form">
				<h1 className="registrant-extra-info__form-title">
					{ translate(
						'Registering a .CA domain'
					) }
				</h1>
				<p className="registrant-extra-info__form-desciption">
					{ translate(
						'Almost done! We need some extra details to register domains ending in ".ca".'
					) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="legal-type">
						{ translate( 'Choose the option that best describes you:' ) }
					</FormLabel>
					<FormSelect
						id="legal-type"
						value={ legalType }
						countriesList={ this.props.countriesList }
						className="registrant-extra-info__form-country-select"
						onChange={ this.handleChangeEvent } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="legal-type">
						{ translate( 'Cira Agreement' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox id="cira_acceptance" value={ ciraAccepted } />
						<span>{
							translate( 'I have read and agree to the {{a}}CIRA Registrant Agreement{{/a}}',
								{
									components: {
										a: <a href={ agreementUrl} />
									}
								}
							)
						}</span>
					</FormLabel>
				</FormFieldset>

				{ this.props.children }
			</form>
		);
	}
}

export default connect(
	state => ( { contactDetails: getContactDetailsCache( state ) } ),
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoCaForm ) );
