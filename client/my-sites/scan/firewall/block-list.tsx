import { Button } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import React, { useCallback, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useWafMutation, useWafQuery } from './data';

/**
 * Blocked IP List Setting
 */
export default function BlockList() {
	const { data: waf, isLoading } = useWafQuery();
	const { mutate: updateWaf, isPending: isUpdating } = useWafMutation();

	const [ inputState, setInputState ] = useState( '' );

	const toggleIpBlockList = useCallback( () => {
		updateWaf( {
			jetpack_waf_ip_block_list_enabled: ! waf?.jetpack_waf_ip_block_list_enabled,
		} );
	}, [ updateWaf, waf?.jetpack_waf_ip_block_list_enabled ] );

	const saveIpBlockList = useCallback( () => {
		updateWaf( { jetpack_waf_ip_block_list: inputState } );
	}, [ inputState, updateWaf ] );

	// Do not render if the WAF is not supported.
	if ( ! waf || ! waf?.waf_supported ) {
		return null;
	}

	return (
		<FormFieldset>
			<ToggleControl
				disabled={ isLoading || isUpdating }
				onChange={ toggleIpBlockList }
				checked={ !! waf.jetpack_waf_ip_block_list_enabled }
				label={
					<>
						<div>{ translate( 'Block IP addresses' ) }</div>
						<FormSettingExplanation>
							{ translate(
								'Stop specific visitors from accessing your site by their IP address.'
							) }
						</FormSettingExplanation>
						{ waf?.jetpack_waf_ip_block_list_enabled && (
							<>
								<FormTextarea
									id="jetpack_waf_ip_block_list"
									value={ inputState }
									onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
										setInputState( e.target.value )
									}
									disabled={ isLoading || isUpdating || ! waf?.jetpack_waf_ip_block_list_enabled }
									placeholder={ translate( 'Example: 12.12.12.1-12.12.12.100' ) }
								/>
								<FormSettingExplanation>
									{ translate(
										'IPv4 and IPv6 supported. Separate IPs with commas, spaces, or new lines. To specify a range, use CIDR notation (i.e. 12.12.12.0/24) or enter the low value and high value separated by a dash (i.e. 12.12.12.0–12.12.12.255).'
									) }
								</FormSettingExplanation>
								<div className="firewall__block-list-controls">
									<div>
										<Button
											onClick={ saveIpBlockList }
											disabled={ isLoading || isUpdating }
											primary
										>
											{ translate( 'Save block list' ) }
										</Button>
									</div>
								</div>
							</>
						) }
					</>
				}
			/>
		</FormFieldset>
	);
}
