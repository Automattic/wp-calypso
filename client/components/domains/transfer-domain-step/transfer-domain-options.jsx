/**
 * External dependencies
 *
 * @format
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';

class TransferDomainOptions extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.string,
		onSubmit: PropTypes.func,
	};

	onClick = () => {
		this.props.onSubmit( this.props.domain );
	};

	state = {
		nameservers: true,
		privacy: true,
	};

	toggleNameservers = event => {
		this.setState( {
			nameservers: event.target.checked,
		} );
	};

	togglePrivacy = event => {
		this.setState( {
			privacy: event.target.checked,
		} );
	};

	render() {
		const { translate } = this.props;
		const headerLabel = translate(
			'We found some DNS records on the domain that affect how your domain works. Carefully review ' +
				"the options below to make sure it's transferred and set up correctly."
		);

		return (
			<div className="transfer-domain-step__options">
				<SectionHeader>{ headerLabel }</SectionHeader>
				<Card>
					<FormFieldset>
						<FormLegend>{ translate( 'Manage your domain at WordPress.com.' ) }</FormLegend>
						<FormLabel>
							<FormCheckbox
								onChange={ this.toggleNameservers }
								checked={ this.state.nameservers }
							/>
							<span>
								{ translate(
									'{{strong}}Recommended{{/strong}} so you can change settings, add e-mail, ' +
										'and more from your WordPress.com dashboard.',
									{
										components: { strong: <strong /> },
									}
								) }
							</span>
						</FormLabel>
					</FormFieldset>
					<FormFieldset>
						<FormLegend>{ translate( 'Make contact information private.' ) }</FormLegend>
						<FormLabel>
							<FormCheckbox onChange={ this.togglePrivacy } checked={ this.state.privacy } />
							<span>
								{ translate(
									'{{strong}}Recommended{{/strong}} to hide your identity. Domain owners have to ' +
										'share contact information in a public database. With Privacy Protection, we publish ' +
										'our own information and forward any communication to you.',
									{
										components: { strong: <strong /> },
									}
								) }
							</span>
						</FormLabel>
					</FormFieldset>

					<div className="transfer-domain-step__continue">
						<Button className="transfer-domain-step__in-card" onClick={ this.onClick }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( TransferDomainOptions );
