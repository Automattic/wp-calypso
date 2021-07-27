/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import FormLabel from 'calypso/components/forms/form-label';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from 'calypso/lib/url/support';

/**
 * Style dependencies
 */
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
						link: (
							<a
								href={ UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
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
