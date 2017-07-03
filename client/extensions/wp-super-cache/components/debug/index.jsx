/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';

class DebugTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
	};

	render() {
		const {
			translate,
		} = this.props;

		return (
			<div>
				<SectionHeader
					label={ translate( 'Debug' ) }>
				</SectionHeader>
				<Card>
					<form>
						<FormFieldset>
							<FormToggle>
								<span>
									{ translate( 'Enable Debugging' ) }
								</span>
							</FormToggle>
						</FormFieldset>
						<div className="wp-super-cache__debug-fieldsets">
							<FormFieldset>
								<FormLabel htmlFor="ipAddress">
									{ translate( 'IP Address' ) }
								</FormLabel>
								<FormTextInput id="ipAddress">
								</FormTextInput>
								<FormSettingExplanation>
									{ translate(
										'(only log requests from this IP address. Your IP is %(ipAddress)s)',
										{
											args: { ipAddress: '1.2.3.4' },
										}
									) }
								</FormSettingExplanation>
							</FormFieldset>
							<FormFieldset>
								<FormToggle>
									<span>
										{ translate( 'Cache Status Messages' ) }
									</span>
								</FormToggle>
								<FormSettingExplanation>
									{
										translate(
											'Display comments at the end of every page like this:'
										)
									}
								</FormSettingExplanation>
							</FormFieldset>
						</div>
					</form>
				</Card>
				<SectionHeader
					label={ translate( 'Advanced' ) }>
				</SectionHeader>
				<Card>
				</Card>
			</div>
		);
	}
}

export default localize( DebugTab );
