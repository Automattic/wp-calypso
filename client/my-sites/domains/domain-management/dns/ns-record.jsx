import { FormInputValidation, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

class NsRecord extends Component {
	static propTypes = {
		fieldValues: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		selectedDomain: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		show: PropTypes.bool.isRequired,
	};

	render() {
		const { fieldValues, isValid, onChange, selectedDomain, selectedDomainName, show, translate } =
			this.props;
		const classes = clsx( { 'is-hidden': ! show } );
		const isNameValid = isValid( 'name' );
		const isDataValid = isValid( 'data' );
		const isTTLValid = isValid( 'ttl' );

		const nameLabel = selectedDomain?.isSubdomain
			? translate( 'Name (optional)', { context: 'Dns Record' } )
			: translate( 'Name', { context: 'Dns Record' } );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ nameLabel }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ translate( 'Enter subdomain', {
							context:
								'Placeholder shown when entering the optional subdomain part of a new DNS record',
						} ) }
						isError={ ! isNameValid }
						onChange={ onChange }
						value={ fieldValues.name }
						suffix={ '.' + selectedDomainName }
					/>
					{ ! isNameValid && <FormInputValidation text={ translate( 'Invalid Name' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Host' ) }</FormLabel>
					<FormTextInput
						name="data"
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ translate( 'e.g. %(example)s', {
							args: { example: 'ns1.example.com' },
						} ) }
					/>
					{ ! isDataValid && <FormInputValidation text={ translate( 'Invalid Host' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>TTL (time to live)</FormLabel>
					<FormTextInput
						name="ttl"
						isError={ ! isTTLValid }
						onChange={ onChange }
						value={ fieldValues.ttl }
						defaultValue={ 3600 }
						placeholder={ 3600 }
					/>
					{ ! isTTLValid && (
						<FormInputValidation
							text={ translate( 'Invalid TTL value - Use a value between 300 and 86400' ) }
							isError
						/>
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySiteId( state, selectedSite?.ID );

	return {
		selectedSite,
		domains,
	};
} )( localize( NsRecord ) );
