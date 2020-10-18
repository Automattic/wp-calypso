/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { includes, some, trim, trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import { Button } from '@automattic/components';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import SupportInfo from 'calypso/components/support-info';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';

class Protect extends Component {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	handleAddToAllowedList = () => {
		const { setFieldValue } = this.props;
		let allowedIps = trimEnd( this.getProtectAllowedIps() );

		if ( allowedIps.length ) {
			allowedIps += '\n';
		}

		setFieldValue( 'jetpack_protect_global_whitelist', allowedIps + this.getIpAddress() );
	};

	getIpAddress() {
		if ( window.app && window.app.clientIp ) {
			return window.app.clientIp;
		}

		return null;
	}

	getProtectAllowedIps() {
		const { jetpack_protect_global_whitelist } = this.props.fields;
		return jetpack_protect_global_whitelist || '';
	}

	isIpAddressAllowed() {
		const ipAddress = this.getIpAddress();
		if ( ! ipAddress ) {
			return false;
		}

		const allowedIps = this.getProtectAllowedIps().split( '\n' );

		return (
			includes( allowedIps, ipAddress ) ||
			some( allowedIps, ( entry ) => {
				if ( entry.indexOf( '-' ) < 0 ) {
					return false;
				}

				const range = entry.split( '-' ).map( trim );
				return includes( range, ipAddress );
			} )
		);
	}

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			protectModuleActive,
			protectModuleUnavailable,
			selectedSiteId,
			translate,
		} = this.props;

		const ipAddress = this.getIpAddress();
		const isIpAllowed = this.isIpAddressAllowed();
		const disabled =
			isRequestingSettings || isSavingSettings || protectModuleUnavailable || ! protectModuleActive;
		const protectToggle = (
			<JetpackModuleToggle
				siteId={ selectedSiteId }
				moduleSlug="protect"
				label={ translate( 'Prevent and block malicious login attempts' ) }
				disabled={ isRequestingSettings || isSavingSettings || protectModuleUnavailable }
			/>
		);

		return (
			<FoldableCard
				className="protect__foldable-card site-settings__foldable-card"
				header={ protectToggle }
			>
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<FormFieldset>
					<div className="protect__module-settings site-settings__child-settings">
						<SupportInfo
							text={ translate(
								'Protects your site from traditional and distributed brute force login attacks.'
							) }
							link="https://jetpack.com/support/protect/"
						/>
						<p>
							{ translate( 'Your current IP address: {{strong}}%(IP)s{{/strong}}{{br/}}', {
								args: {
									IP: ipAddress || translate( 'Unknown IP address' ),
								},
								components: {
									strong: <strong />,
									br: <br />,
								},
							} ) }

							{ ipAddress && (
								<Button
									className="site-settings__add-to-explicitly-allowed-list"
									onClick={ this.handleAddToAllowedList }
									disabled={ disabled || isIpAllowed }
									compact
								>
									{ isIpAllowed
										? translate( 'Already in list of allowed IPs' )
										: translate( 'Add to list of allowed IPs' ) }
								</Button>
							) }
						</p>

						<FormLabel htmlFor="jetpack_protect_global_whitelist">
							{ translate( 'Allowed IP addresses' ) }
						</FormLabel>
						<FormTextarea
							id="jetpack_protect_global_whitelist"
							value={ this.getProtectAllowedIps() }
							onChange={ onChangeField( 'jetpack_protect_global_whitelist' ) }
							disabled={ disabled }
							placeholder={ translate( 'Example: 12.12.12.1-12.12.12.100' ) }
						/>
						<FormSettingExplanation>
							{ translate(
								'You may explicitly allow an IP address or series of addresses preventing them from ' +
									'ever being blocked by Jetpack. IPv4 and IPv6 are acceptable. ' +
									'To specify a range, enter the low value and high value separated by a dash. ' +
									'Example: 12.12.12.1-12.12.12.100'
							) }
						</FormSettingExplanation>
					</div>
				</FormFieldset>
			</FoldableCard>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'protect'
	);

	return {
		selectedSiteId,
		protectModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'protect' ),
		protectModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Protect ) );
