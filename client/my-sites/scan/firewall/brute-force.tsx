import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import React, { useCallback } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { useWafMutation, useWafQuery } from './data';

/**
 * Brute Force Login Protection Setting
 */
export default function BruteForce() {
	const { data: waf, isLoading } = useWafQuery();
	const { mutate: updateWaf, isPending: isUpdating } = useWafMutation();

	const toggleBruteForceProtection = useCallback( () => {
		updateWaf( {
			brute_force_protection: ! waf?.brute_force_protection,
		} );
	}, [ updateWaf, waf?.brute_force_protection ] );

	// Do not render when the WAF data is not available.
	if ( ! waf ) {
		return null;
	}

	return (
		<FormFieldset>
			<ToggleControl
				disabled={ isLoading || isUpdating }
				onChange={ toggleBruteForceProtection }
				checked={ !! waf?.brute_force_protection }
				label={
					<>
						<div>{ translate( 'Brute force login protection' ) }</div>
						<FormSettingExplanation>
							{ translate(
								'Prevent bots and hackers from attempting to log in to your website with common username and password combinations.'
							) }
						</FormSettingExplanation>
					</>
				}
			/>
		</FormFieldset>
	);
}
