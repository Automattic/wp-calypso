import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty, omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormSelect from 'calypso/components/forms/form-select';

import './style.scss';

export class FormCountrySelect extends Component {
	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		className: PropTypes.string,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
		translate: PropTypes.func.isRequired,
	};

	getOptions() {
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
				className={ classnames( this.props.className, 'form-country-select' ) }
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
