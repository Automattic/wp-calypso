/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { transform } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import PrivacyProtectionExample from './privacy-protection-example';
import getProtectedContactInformation from 'lib/domains/whois/protected-contact-information';

export default localize( React.createClass( {
	displayName: 'PrivacyProtectionDialog',

	getDefaultProps: function() {
		return {
			isVisible: false
		};
	},

	formatAsFields: function( contactInformation ) {
		return transform( contactInformation, ( result, value, key ) => {
			result[ key ] = { value };
		}, {} );
	},

	render: function() {
		let privacyPrice = this.props.translate( '%(cost)s per domain / year', { args: { cost: this.props.cost } } );
		if ( this.props.isFree ) {
			privacyPrice =
				<span className="privacy-free-text">
					{ this.props.translate( 'Free with your plan' ) }
				</span>;
		}

		return (
		    <Dialog additionalClassNames="privacy-protection-dialog" isVisible={ this.props.isVisible } onClose={ this.props.onClose }>
				<header>
					<h1>{ this.props.translate( 'Why do I need Privacy Protection?' ) }</h1>
					<p>
						{ this.props.translate( 'Domains are required to have publicly accessible contact information.' ) }
						<span className="line-break">
							{ this.props.translate( 'With Privacy Protection, we show our partner\'s contact information instead of your own, helping to:' ) }
						</span>
					</p>
				</header>
				<ul className="privacy-features">
					<li>
						<h2>{ this.props.translate( 'Protect your identity online' ) }</h2>
					</li>
					<li>
						<h2>{ this.props.translate( 'Hide your email from spammers' ) }</h2>
					</li>
				</ul>
				<ul className="privacy-comparison">
					<li className="with-privacy">
						<h3>{ this.props.translate( 'With Privacy Protection' ) }</h3>
						<div className="privacy-price">
							{ privacyPrice }
						</div>
						<PrivacyProtectionExample
							countriesList= { this.props.countriesList }
							fields={ this.formatAsFields( getProtectedContactInformation( this.props.domain, this.props.registrar ) ) } />
						<button
								className="button is-primary"
								disabled={ this.props.disabled }
								onClick={ this.props.onSelect.bind( null, { addPrivacy: true } ) }>
							{ this.props.translate( 'Add Privacy Protection' ) }
						</button>
					</li>
					<li className="without-privacy">
						<h3>{ this.props.translate( 'Without Privacy Protection' ) }</h3>
						<div className="privacy-price">{ this.props.translate( 'No additional cost' ) }</div>
						<PrivacyProtectionExample
							countriesList= { this.props.countriesList }
							fields={ this.props.fields } />
						<button
								className="button"
								disabled={ this.props.disabled }
								onClick={ this.props.onSelect.bind( null, { addPrivacy: false } ) }>
							{ this.props.translate( 'Publish My Information' ) }
						</button>
					</li>
				</ul>
			</Dialog>
		);
	}
} ) );
