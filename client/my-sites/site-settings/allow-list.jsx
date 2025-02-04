import { Button, Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { includes, some } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';

class AllowList extends Component {
	static propTypes = {
		fields: PropTypes.object.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
		isRequestingSettings: true,
		isSavingSettings: false,
	};

	togglingAllowListSupported = () => {
		return this.props.settings.jetpack_waf_ip_allow_list_enabled !== undefined;
	};

	showAllowList = () => {
		return (
			! this.togglingAllowListSupported() || this.props.fields.jetpack_waf_ip_allow_list_enabled
		);
	};

	handleAddToAllowedList = () => {
		const { setFieldValue } = this.props;
		let allowedIps = this.getProtectAllowedIps().trimEnd();

		if ( allowedIps.length ) {
			allowedIps += '\n';
		}

		setFieldValue( 'jetpack_waf_ip_allow_list', allowedIps + this.getIpAddress() );
	};

	getIpAddress() {
		if ( window.app && window.app.clientIp ) {
			return window.app.clientIp;
		}

		return null;
	}

	getProtectAllowedIps() {
		const { jetpack_waf_ip_allow_list } = this.props.fields;
		return jetpack_waf_ip_allow_list || '';
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

				const range = entry.split( '-' ).map( ( ip ) => ip.trim() );
				return includes( range, ipAddress );
			} )
		);
	}

	disableForm() {
		return this.props.isRequestingSettings || this.props.isSavingSettings;
	}

	render() {
		const { translate } = this.props;
		const ipAddress = this.getIpAddress();
		const isIpAllowed = this.isIpAddressAllowed();

		return (
			<div className="site-settings__allow-list-settings">
				<Card>
					<FormFieldset>
						{ this.togglingAllowListSupported() ? (
							<ToggleControl
								disabled={ this.disableForm() }
								onChange={ this.props.handleAutosavingToggle(
									'jetpack_waf_ip_allow_list_enabled'
								) }
								checked={ !! this.props.fields.jetpack_waf_ip_allow_list_enabled }
								label={ translate( 'Always allow specific IP addresses' ) }
							/>
						) : (
							<FormLegend>{ translate( 'Always allow specific IP addresses' ) }</FormLegend>
						) }{ ' ' }
						<FormSettingExplanation isIndented={ !! this.togglingAllowListSupported() }>
							{ translate(
								"IP addresses added to this list will never be blocked by Jetpack's security features."
							) }
						</FormSettingExplanation>
						{ this.showAllowList() && (
							<div
								className={ `protect__module-settings ${
									this.togglingAllowListSupported() ? 'site-settings__child-settings' : ''
								}` }
							>
								<FormTextarea
									id="jetpack_waf_ip_allow_list"
									value={ this.getProtectAllowedIps() }
									onChange={ this.props.onChangeField( 'jetpack_waf_ip_allow_list' ) }
									disabled={ this.disableForm() }
									placeholder={ translate( 'Example: 12.12.12.1-12.12.12.100' ) }
								/>
								<FormSettingExplanation>
									{ translate(
										'IPv4 and IPv6 are acceptable. ' +
											'To specify a range, enter the low value and high value separated by a dash. ' +
											'Example: 12.12.12.1-12.12.12.100'
									) }
								</FormSettingExplanation>
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
											disabled={ this.disableForm() || isIpAllowed }
											compact
										>
											{ isIpAllowed
												? translate( 'Already in list of allowed IPs' )
												: translate( 'Add to list of allowed IPs' ) }
										</Button>
									) }
								</p>
							</div>
						) }
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

export default localize( AllowList );
