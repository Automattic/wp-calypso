/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

class PrivacyProtection extends Component {
	enablePrivacy = () => {
		this.props.onRadioSelect( true );
	};

	disablePrivacy = () => {
		this.props.onRadioSelect( false );
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader
					className="checkout__privacy-protection-header"
					label={ translate( 'Privacy Protection' ) }
				/>
				<Card className="checkout__privacy-protection-radio">
					<div>
						{ translate(
							'Domain owners have to share contact information in a public database of all domains. ' +
								'With {{strong}}Privacy Protection{{/strong}}, we publish our own information instead of yours, ' +
								'and privately forward any communication to you.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</div>
					<div className="checkout__privacy-protection-radio-buttons">
						<FormFieldset>
							<FormLabel className="checkout__privacy-protection-radio-button">
								<FormRadio
									value="private"
									id="registrantType"
									checked={ this.props.checkPrivacyRadio }
									onChange={ this.enablePrivacy }
								/>
								<p className="checkout__privacy-protection-radio-text">
									<span>
										{ translate(
											'{{strong}}Register privately with Privacy Protection{{/strong}} (recommended)' +
												'',
											{
												components: {
													strong: <strong />,
												},
											}
										) }
									</span>
									<br />
									<span className="checkout__privacy-protection-radio-text-description">
										{ translate(
											'Protects your identity and prevents spam by keeping your contact information ' +
												'off the Internet.'
										) }
									</span>
								</p>
							</FormLabel>

							<FormLabel className="checkout__privacy-protection-radio-button">
								<FormRadio
									value="public"
									id="registrantType"
									checked={ ! this.props.checkPrivacyRadio }
									onChange={ this.disablePrivacy }
								/>
								<p className="checkout__privacy-protection-radio-text">
									<span>
										{ translate( '{{strong}}Register publicly{{/strong}}', {
											components: {
												strong: <strong />,
											},
										} ) }
									</span>
									<br />
									<span className="checkout__privacy-protection-radio-text-description">
										{ translate(
											'Your contact information will be listed in a public database and will be ' +
												'susceptible to spam.'
										) }
									</span>
								</p>
							</FormLabel>
						</FormFieldset>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( PrivacyProtection );
