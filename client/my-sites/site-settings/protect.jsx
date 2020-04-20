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
import FoldableCard from 'components/foldable-card';
import { Button } from '@automattic/components';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextarea from 'components/forms/form-textarea';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SupportInfo from 'components/support-info';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';

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

	handleAddToWhitelist = () => {
		const { setFieldValue } = this.props;
		let whitelist = trimEnd( this.getProtectWhitelist() );

		if ( whitelist.length ) {
			whitelist += '\n';
		}

		setFieldValue( 'jetpack_protect_global_whitelist', whitelist + this.getIpAddress() );
	};

	getIpAddress() {
		if ( window.app && window.app.clientIp ) {
			return window.app.clientIp;
		}

		return null;
	}

	getProtectWhitelist() {
		const { jetpack_protect_global_whitelist } = this.props.fields;
		return jetpack_protect_global_whitelist || '';
	}

	isIpAddressWhitelisted() {
		const ipAddress = this.getIpAddress();
		if ( ! ipAddress ) {
			return false;
		}

		const whitelist = this.getProtectWhitelist().split( '\n' );

		return (
			includes( whitelist, ipAddress ) ||
			some( whitelist, ( entry ) => {
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
		const isIpWhitelisted = this.isIpAddressWhitelisted();
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
									className="protect__add-to-whitelist site-settings__add-to-whitelist"
									onClick={ this.handleAddToWhitelist }
									disabled={ disabled || isIpWhitelisted }
									compact
								>
									{ isIpWhitelisted
										? translate( 'Already in whitelist' )
										: translate( 'Add to whitelist' ) }
								</Button>
							) }
						</p>

						<FormLabel htmlFor="jetpack_protect_global_whitelist">
							{ translate( 'Whitelisted IP addresses' ) }
						</FormLabel>
						<FormTextarea
							id="jetpack_protect_global_whitelist"
							value={ this.getProtectWhitelist() }
							onChange={ onChangeField( 'jetpack_protect_global_whitelist' ) }
							disabled={ disabled }
							placeholder={ translate( 'Example: 12.12.12.1-12.12.12.100' ) }
						/>
						<FormSettingExplanation>
							{ translate(
								'You may whitelist an IP address or series of addresses preventing them from ' +
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
