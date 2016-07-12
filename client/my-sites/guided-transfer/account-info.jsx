/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

export default React.createClass( {
	propTypes: {
		hostInfo: PropTypes.shape( {
			label: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired
		} ).isRequired
	},

	render() {
		const { hostInfo } = this.props;

		return (
			<div>
				<SectionHeader label={ this.translate( 'Account Info' ) } />
				<CompactCard>
					<p>
						{ this.translate(
							'Please enter your credentials. They will be stored securely so that one ' +
							'of our Happiness Engineers can get the transfer going for you.' ) }
					</p>
					<div>
						<FormFieldset className="guided-transfer__account-username-fieldset">
							<FormLabel htmlFor="username">{ this.translate( '%(host)s account username', {
								args: {
									host: hostInfo.label
								}
							} ) }</FormLabel>
							<FormTextInput
								id="username"
								placeholder={ this.translate( 'Username' ) } />
						</FormFieldset>

						<FormFieldset className="guided-transfer__account-password-fieldset">
							<FormLabel htmlFor="password">{ this.translate( '%(host)s account password', {
								args: {
									host: hostInfo.label
								}
							} ) }</FormLabel>
							<FormPasswordInput
								autoCapitalize="off"
								autoComplete="off"
								autoCorrect="off"
								id="password"
								placeholder={ this.translate( 'Password' ) } />
						</FormFieldset>
					</div>
					<FormSettingExplanation className="guided-transfer__account-info-tip">
						{ this.translate(
							'You don\'t have a %(host)s account yet? ' +
							'{{host_link}}Create one{{/host_link}} and return here.', {
								components: {
									host_link: <a href={ hostInfo.url } />
								},
								args: {
									host: hostInfo.label
								}
							}
						) }
					</FormSettingExplanation>
				</CompactCard>
				<CompactCard>
					<FormButton>Continue</FormButton>
				</CompactCard>
			</div>
		);
	}
} );
