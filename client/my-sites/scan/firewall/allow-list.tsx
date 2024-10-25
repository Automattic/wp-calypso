import { Button } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { includes, some } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useWafMutation, useWafQuery } from './data';

export default function AllowList() {
	const { data: waf, isLoading } = useWafQuery();
	const { mutate: updateWaf, isPending: isUpdating } = useWafMutation();

	const [ inputState, setInputState ] = useState( '' );

	const togglingAllowListSupported = useMemo(
		() => waf?.jetpack_waf_ip_allow_list_enabled !== undefined,
		[ waf?.jetpack_waf_ip_allow_list_enabled ]
	);

	const showAllowList = useMemo(
		() => ! togglingAllowListSupported || waf?.jetpack_waf_ip_allow_list_enabled,
		[ waf?.jetpack_waf_ip_allow_list_enabled, togglingAllowListSupported ]
	);

	const ipAddress = useMemo( () => {
		if ( window.app && window.app.clientIp ) {
			return window.app.clientIp;
		}

		return null;
	}, [] );

	const isIpAllowed = useMemo( () => {
		if ( ! ipAddress ) {
			return false;
		}

		const allowedIps = inputState.split( '\n' );

		return (
			includes( allowedIps, ipAddress ) ||
			some( allowedIps, ( entry ) => {
				if ( entry.indexOf( '-' ) < 0 ) {
					return false;
				}

				const range = entry.split( '-' ).map( ( ip ) => ip.trim() );
				return includes( range, ipAddress );
			} )
		);
	}, [ ipAddress, inputState ] );

	const toggleIpAllowList = useCallback( () => {
		updateWaf( {
			jetpack_waf_ip_allow_list_enabled: ! waf?.jetpack_waf_ip_allow_list_enabled,
		} );
	}, [ updateWaf, waf?.jetpack_waf_ip_allow_list_enabled ] );

	const saveIpAllowList = useCallback( () => {
		updateWaf( { jetpack_waf_ip_allow_list: inputState } );
	}, [ inputState, updateWaf ] );

	const addCurrentIpToAllowList = useCallback( () => {
		let allowedIps = inputState.trimEnd();

		if ( allowedIps.length ) {
			allowedIps += '\n';
		}

		setInputState( allowedIps + ipAddress );
	}, [ ipAddress, inputState ] );

	useEffect( () => {
		if ( waf?.jetpack_waf_ip_allow_list ) {
			setInputState( waf.jetpack_waf_ip_allow_list );
		}
	}, [ waf?.jetpack_waf_ip_allow_list ] );

	// Do not render when the WAF data is not available.
	if ( ! waf ) {
		return null;
	}

	return (
		<FormFieldset>
			<ToggleControl
				disabled={ isLoading || isUpdating || ! togglingAllowListSupported }
				onChange={ toggleIpAllowList }
				checked={ ! togglingAllowListSupported || !! waf?.jetpack_waf_ip_allow_list_enabled }
				label={
					<>
						<div>{ translate( 'Trusted IP addresses' ) }</div>
						<FormSettingExplanation>
							{ translate(
								'IP addresses added to this list are always allowed to access your site, regardless of any other Jetpack security settings.'
							) }
						</FormSettingExplanation>
						{ showAllowList && (
							<>
								<FormTextarea
									id="jetpack_waf_ip_allow_list"
									value={ inputState }
									onChange={ ( e ) => setInputState( e.target.value ) }
									disabled={ isLoading || isUpdating }
									placeholder={ translate( 'Example: 12.12.12.1-12.12.12.100' ) }
								/>
								<FormSettingExplanation>
									{ translate(
										'IPv4 and IPv6 supported. Separate IPs with commas, spaces, or new lines. To specify a range, use CIDR notation (i.e. 12.12.12.0/24) or enter the low value and high value separated by a dash (i.e. 12.12.12.0–12.12.12.255).'
									) }
								</FormSettingExplanation>
								<div className="firewall__allow-list-controls">
									<div className="firewall__current-ip">
										<div>
											{ translate( 'Your current IP: {{strong}}%(IP)s{{/strong}}', {
												args: {
													IP: ipAddress || translate( 'Unknown IP address' ),
												},
												components: {
													strong: <strong />,
												},
											} ) }
										</div>

										{ ipAddress && (
											<div>
												<Button
													className="site-settings__add-to-explicitly-allowed-list"
													onClick={ addCurrentIpToAllowList }
													disabled={ isLoading || isUpdating || isIpAllowed }
													compact
												>
													{ isIpAllowed
														? translate( 'Already in list of trusted IPs' )
														: translate( 'Add to Trusted IPs' ) }
												</Button>
											</div>
										) }
									</div>
									<div>
										<Button
											onClick={ saveIpAllowList }
											disabled={ isLoading || isUpdating }
											primary
										>
											{ translate( 'Save allow list' ) }
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
