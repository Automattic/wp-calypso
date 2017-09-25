/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PrivacyProtectionDialog from './privacy-protection-dialog';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import SectionHeader from 'components/section-header';
import { abtest } from 'lib/abtest';
import { cartItems } from 'lib/cart-values';

class PrivacyProtection extends Component {
	handleDialogSelect = ( options, event ) => {
		event.preventDefault();
		this.props.onDialogSelect( Object.assign( options, this.state ) );
		this.setState( { skipFinish: false } );
	};

	handleDialogOpen = () => {
		this.setState( { skipFinish: true } );
		this.props.onDialogOpen();
	};

	handleDialogClose = () => {
		this.props.onDialogClose();
	};

	hasDomainPartOfPlan = () => {
		const cart = this.props.cart;
		return cart.has_bundle_credit || cartItems.hasPlan( cart );
	};

	getPrivacyProtectionCost() {
		const products = this.props.productsList.get();
		return products.private_whois.cost_display;
	}

	renderOriginal() {
		const domainRegistrations = cartItems.getDomainRegistrations( this.props.cart ),
			{ translate } = this.props,
			numberOfDomainRegistrations = domainRegistrations.length,
			firstDomainToRegister = domainRegistrations[ 0 ],
			hasOneFreePrivacy = this.hasDomainPartOfPlan() && numberOfDomainRegistrations === 1,
			privacyText = translate(
				'Privacy Protection hides your personal information in your domain\'s public records, ' +
				'to protect your identity and prevent spam.'
			),
			freeWithPlan = hasOneFreePrivacy &&
					<span className="checkout__privacy-protection-free-text">
						{ translate( 'Free with your plan' ) }
					</span>;

		return (
			<div>
				<Card className="checkout__privacy-protection-checkbox">
					<input
						type="checkbox"
						id="privacyProtectionCheckbox"
						onChange={ this.props.onCheckboxChange }
						checked={ this.props.isChecked } />
					<div className="checkout__privacy-protection-checkbox-description">
						<label htmlFor="privacyProtectionCheckbox">
							<strong className="checkout__privacy-protection-checkbox-heading">
								{ translate( 'Please keep my information private.', { textOnly: true } ) }
							</strong>
						</label>
						<p className={ 'checkout__privacy-protection-price-text' }>
							<span className={ classnames( { 'free-with-plan': hasOneFreePrivacy } ) }>
								{
									translate(
										'%(cost)s per year',
										'%(cost)s per domain per year',
										{
											args: { cost: this.getPrivacyProtectionCost() },
											count: numberOfDomainRegistrations
										}
									)
								}
							</span>
							{ freeWithPlan }
						</p>
						<p className="checkout__privacy-protection-checkbox-text">{ privacyText }</p>
						<a href="" onClick={ this.handleDialogOpen }>{ translate( 'Learn more about Privacy Protection.' ) }</a>
					</div>
					<div>
						<Gridicon icon="lock" size={ 48 } />
					</div>
				</Card>
				<PrivacyProtectionDialog
					disabled={ this.props.disabled }
					domain={ firstDomainToRegister.meta }
					registrar={ firstDomainToRegister.extra && firstDomainToRegister.extra.registrar }
					cost={ this.getPrivacyProtectionCost() }
					countriesList={ this.props.countriesList }
					fields={ this.props.fields }
					isVisible={ this.props.isDialogVisible }
					isFree={ hasOneFreePrivacy }
					onSelect={ this.handleDialogSelect }
					onClose={ this.handleDialogClose }
				/>
			</div>
		);
	}

	enablePrivacy = () => {
		this.props.onRadioSelect( true );
	};

	disablePrivacy = () => {
		this.props.onRadioSelect( false );
	};

	renderNoPopup() {
		const domainRegistrations = cartItems.getDomainRegistrations( this.props.cart );
		const { translate } = this.props;
		const numberOfDomainRegistrations = domainRegistrations.length;
		const hasOneFreePrivacy = this.hasDomainPartOfPlan() && numberOfDomainRegistrations === 1;

		return (
			<div>
				<SectionHeader className="checkout__privacy-protection-header" label = { translate( 'Privacy Protection' ) } />
				<Card className="checkout__privacy-protection-radio">
					<div>
						{ translate(
							'Domain owners have to share contact information in a public database of all domains. ' +
							'With {{strong}}Privacy Protection{{/strong}}, we publish our own information instead of yours, ' +
							'and privately forward any communication to you.',
							{
								components: {
									strong: <strong />
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
									checked={ this.props.allDomainsHavePrivacy }
									onChange={ this.enablePrivacy }
								/>
								<p className="checkout__privacy-protection-radio-text">
									<span>
										{
											translate(
												'{{strong}}Register privately with Privacy Protection{{/strong}} (recommended)' +
												'',
												{
													components: {
														strong: <strong />,
													},
												}
											)
										}
									</span>
									<span
										className={
											classnames(
												'checkout__privacy-protection-radio-price-text',
												{ 'free-with-plan': hasOneFreePrivacy }
											)
										}
									>
										{
											translate(
												'%(cost)s/year',
												'%(cost)s per domain/year',
												{
													args: { cost: this.getPrivacyProtectionCost() },
													count: numberOfDomainRegistrations
												}
											)
										}
									</span>
									{ hasOneFreePrivacy && (
										<span className="checkout__privacy-protection-free-text">
											{ translate( 'Free with your plan' ) }
										</span>
									) }
									<br />
									<span className="checkout__privacy-protection-radio-text-description">
									{
										translate(
											'Protects your identity and prevents spam by keeping your contact information ' +
											'off the Internet.'
										)
									}
									</span>
								</p>
							</FormLabel>

							<FormLabel className="checkout__privacy-protection-radio-button">
								<FormRadio
									value="public"
									id="registrantType"
									checked={ ! this.props.allDomainsHavePrivacy }
									onChange={ this.disablePrivacy }
								/>
								<p className="checkout__privacy-protection-radio-text">
									<span>
									{
										translate(
											'{{strong}}Register publicly{{/strong}}',
											{
												components: {
													strong: <strong />,
												},
											}
										)
									}
									</span>
									<br />
									<span className="checkout__privacy-protection-radio-text-description">
									{
										translate(
											'Your contact information will be listed in a public database and will be ' +
											'susceptible to spam.'
										)
									}
									</span>
								</p>
							</FormLabel>
						</FormFieldset>
					</div>
				</Card>
			</div>
		);
	}

	render() {
		if ( abtest( 'privacyNoPopup' ) === 'nopopup' ) {
			return this.renderNoPopup();
		}

		return this.renderOriginal();
	}
}

export default localize( PrivacyProtection );
