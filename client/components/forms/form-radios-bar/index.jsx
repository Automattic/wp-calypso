import { FormLabel } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import FormRadio from 'calypso/components/forms/form-radio';
import FormRadioWithThumbnail from 'calypso/components/forms/form-radio-with-thumbnail';

import './style.scss';

const FormRadiosBar = ( { isThumbnail, checked, onChange, items, disabled } ) => {
	return (
		<div className={ clsx( 'form-radios-bar', { 'is-thumbnail': isThumbnail } ) }>
			{ items.map( ( item, i ) =>
				isThumbnail ? (
					<FormRadioWithThumbnail
						key={ item.value + i }
						checked={ checked === item.value }
						onChange={ onChange }
						disabled={ disabled }
						{ ...item }
					/>
				) : (
					<FormLabel key={ item.value + i }>
						<FormRadio
							checked={ checked === item.value }
							disabled={ disabled }
							onChange={ onChange }
							{ ...item }
						/>
					</FormLabel>
				)
			) }
		</div>
	);
};

FormRadiosBar.propTypes = {
	isThumbnail: PropTypes.bool,
	checked: PropTypes.string,
	onChange: PropTypes.func,
	items: PropTypes.array.isRequired,
};

export default FormRadiosBar;
