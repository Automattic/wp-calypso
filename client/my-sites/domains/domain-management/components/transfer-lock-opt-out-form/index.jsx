import { Gridicon, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import InlineSupportLink from 'calypso/components/inline-support-link';

import './style.scss';

const TransferLockOptOutForm = ( props ) => (
	<div className="transfer-lock-opt-out-form">
		<Gridicon className="transfer-lock-opt-out-form__icon" icon="notice-outline" size={ 18 } />
		<FormLabel className="transfer-lock-opt-out-form__label">
			<FormCheckbox
				name="transfer-lock-opt-out"
				disabled={ props.disabled }
				onChange={ props.onChange }
			/>
			<span>
				{ props.translate( "Opt-out of the 60-day transfer lock. {{link}}What's this?{{/link}}.", {
					components: {
						link: <InlineSupportLink supportContext="60-day-transfer-lock" showIcon={ false } />,
					},
				} ) }
			</span>
		</FormLabel>
	</div>
);

TransferLockOptOutForm.propTypes = {
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
};

export default localize( TransferLockOptOutForm );
