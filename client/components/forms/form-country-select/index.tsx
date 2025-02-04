import clsx from 'clsx';
import { useTranslate, localize } from 'i18n-calypso';
import { isEmpty, omit } from 'lodash';
import { Component } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { HTMLProps } from 'react';

import './style.scss';

export interface FormCountrySelectProps {
	countriesList: CountryListItem[];
	translate: ReturnType< typeof useTranslate >;
}

interface OptionObject {
	key: string | number;
	label: string;
	code?: string;
	disabled?: boolean;
}

export class FormCountrySelect extends Component<
	FormCountrySelectProps & Omit< HTMLProps< HTMLSelectElement >, 'ref' >
> {
	getOptions(): OptionObject[] {
		const { countriesList, translate } = this.props;

		if ( isEmpty( countriesList ) ) {
			return [
				{
					key: '',
					label: translate( 'Loading…' ),
				},
			];
		}

		return countriesList.map( ( { code, name }, idx ) => ( {
			key: idx,
			label: name,
			code,
			disabled: ! code,
		} ) );
	}

	render() {
		const options = this.getOptions();

		return (
			<FormSelect
				{ ...omit( this.props, [
					'className',
					'countriesList',
					'translate',
					'moment',
					'numberFormat',
				] ) }
				className={ clsx( this.props.className, 'form-country-select' ) }
				onChange={ this.props.onChange }
				disabled={ this.props.disabled }
			>
				{ options.map( function ( option ) {
					return (
						<option key={ option.key } value={ option.code } disabled={ option.disabled }>
							{ option.label }
						</option>
					);
				} ) }
			</FormSelect>
		);
	}
}

export default localize( FormCountrySelect );
