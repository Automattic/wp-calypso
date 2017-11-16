/**
 * External dependencies
 *
 * @format
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormattedHeader from 'components/formatted-header';
import { getProductsList } from 'state/products-list/selectors';

class TransferDomainOptions extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.string,
		onSubmit: PropTypes.func,
	};

	onClick = () => {
		const { dnsImport, nameservers, privacy } = this.state;

		this.props.onSubmit( this.props.domain, nameservers, privacy, dnsImport );
	};

	state = {
		dnsImport: true,
		nameservers: true,
		privacy: true,
	};

	toggle( property, value ) {
		this.setState( {
			[ property ]: value,
		} );
	}

	toggleNameservers = event => {
		const value = event.target.checked;

		this.toggle( 'nameservers', value );
		if ( ! value ) {
			this.toggle( 'dnsImport', false );
		}
	};

	togglePrivacy = event => {
		this.toggle( 'privacy', event.target.checked );
	};

	toggleDnsImport = event => {
		this.toggle( 'dnsImport', event.target.checked );
	};

	getHeader() {
		const { translate } = this.props;

		return (
			<Card compact={ true } className="transfer-domain-step__title">
				<FormattedHeader
					headerText={ translate( 'Choose the settings you want to transfer.' ) }
					subHeaderText={ translate(
						'Make sure the everything will be configured the way you want it.'
					) }
				/>
			</Card>
		);
	}

	render() {
		const cost = get( this.props.products, 'private_whois.cost_display', null );
		const { translate } = this.props;

		return (
			<div className="transfer-domain-step__options">
				{ this.getHeader() }
				<Card>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox
								onChange={ this.toggleNameservers }
								checked={ this.state.nameservers }
							/>
							<span>
								<FormLegend>{ translate( 'Manage your domain at WordPress.com.' ) }</FormLegend>
								{ translate(
									'{{strong}}Recommended!{{/strong}} ' +
										"You'll be able to edit your domain settings, create email addresses with your " +
										'domain and more, all from your WordPress.com dashboard.',
									{
										components: { strong: <strong /> },
									}
								) }
							</span>
						</FormLabel>
					</FormFieldset>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox
								disabled={ ! this.state.nameservers }
								onChange={ this.toggleDnsImport }
								checked={ this.state.dnsImport }
							/>
							<span>
								<FormLegend>
									{ translate( 'Use this domain with a WordPress.com site.' ) }
								</FormLegend>
								{ translate(
									"Check this if you're ready to use this domain with a WordPress.com site. " +
										'Once you do, any sites using this domain on another host will no longer be viewable ' +
										'at this web address.',
									{
										components: { strong: <strong /> },
									}
								) }
							</span>
						</FormLabel>
					</FormFieldset>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox onChange={ this.togglePrivacy } checked={ this.state.privacy } />
							<span>
								<FormLegend>
									{ translate( 'Make contact information private.' ) }
									{ cost &&
										translate( '{{small}}+%(cost)s / year{{/small}}', {
											args: { cost },
											components: { small: <small /> },
										} ) }
								</FormLegend>
								{ translate(
									'{{strong}}Recommended!{{/strong}} ' +
										"Domain owners' contact information goes into a public database (it's required). " +
										"With privacy protection, we keep your info private and put WordPress.com's info into " +
										'the database - and forward any communication to you.',
									{
										components: { strong: <strong /> },
									}
								) }
							</span>
						</FormLabel>
					</FormFieldset>

					<div className="transfer-domain-step__continue">
						<div />
						<Button
							className="transfer-domain-step__in-card"
							onClick={ this.onClick }
							primary={ true }
						>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( state => ( {
	products: getProductsList( state ),
} ) )( localize( TransferDomainOptions ) );
