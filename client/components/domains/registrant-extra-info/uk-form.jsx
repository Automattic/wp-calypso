/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { camelCase, difference, isEmpty, keys, map, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { getContactDetailsExtraCache } from 'state/selectors';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

const defaultValues = {
	registrantType: 'IND',
};

class RegistrantExtraInfoUkForm extends React.PureComponent {
	static propTypes = {
		contactDetailsExtra: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const { translate } = props;
		const registrantTypes = {
			IND: translate( 'Individual' ),
			FIND: translate( 'Foreign Individual' ),
			STRA: translate( 'UK Sole Trader', {
				comment: 'Refers to UK legal concept of self-employment/sole proprietorship',
			} ),
			PTNR: translate( 'UK Partnership' ),
			LLP: translate( 'UK Limited Liability Partnership' ),
			CRC: translate( 'UK Corporation by Royal Charter' ),
			FCORP: translate( 'Non-UK Corporation' ),
			IP: translate( 'UK Industrial/Provident Registered Company' ),
			LTD: translate( 'UK Limited Company' ),
			PLC: translate( 'UK Public Limited Company' ),
			SCH: translate( 'UK School' ),
			GOV: translate( 'UK Government Body' ),
			RCHAR: translate( 'UK Registered Charity' ),
			STAT: translate( 'UK Statutory Body' ),
			OTHER: translate( 'UK Entity that does not fit another category' ),
			FOTHER: translate( 'Non-UK Entity that does not fit another category' ),
		};
		const registrantTypeOptions = map( registrantTypes, ( text, optionValue ) => (
			<option value={ optionValue } key={ optionValue }>
				{ text }
			</option>
		) );

		this.state = {
			registrantTypes,
			registrantTypeOptions,
		};
	}

	componentWillMount() {
		// Add defaults to redux state to make accepting default values work.
		const neededRequiredDetails = difference(
			[ 'registrantType' ],
			keys( this.props.contactDetailsExtra )
		);

		// Bail early as we already have the details from a previous purchase.
		if ( isEmpty( neededRequiredDetails ) ) {
			return;
		}

		this.props.updateContactDetailsCache( {
			extra: pick( defaultValues, neededRequiredDetails ),
		} );
	}

	handleChangeEvent = event => {
		this.props.updateContactDetailsCache( {
			extra: { [ camelCase( event.target.id ) ]: event.target.value },
		} );
	};

	render() {
		const { translate } = this.props;
		const { registrantTypeOptions } = this.state;
		const { registrantType } = {
			...defaultValues,
			...this.props.contactDetailsExtra,
		};

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate( 'Almost done! We need some extra details to register your %(tld)s domain.', {
						args: { tld: '.uk' },
					} ) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="registrant-type">
						{ translate( 'Choose the option that best describes your United Kingdom presence:' ) }
					</FormLabel>
					<FormSelect
						id="registrant-type"
						value={ registrantType }
						className="registrant-extra-info__form-registrant-type"
						onChange={ this.handleChangeEvent }
					>
						{ registrantTypeOptions }
					</FormSelect>
				</FormFieldset>

				{ this.props.children }
			</form>
		);
	}
}

export default connect(
	state => ( {
		contactDetailsExtra: getContactDetailsExtraCache( state ),
		userWpcomLang: getCurrentUserLocale( state ),
	} ),
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoUkForm ) );
