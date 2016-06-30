/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const Dialog = require( 'components/dialog' ),
	PrivacyProtectionExample = require( './privacy-protection-example' );

module.exports = React.createClass( {
	displayName: 'PrivacyProtectionDialog',

	getDefaultProps: function() {
		return {
			isVisible: false
		};
	},

	getProtectedFields: function() {
		return {
			firstName: {},
			lastName: {},
			organization: { value: 'Domains By Proxy, LLC' },
			email: { value: this.props.domain + '@domainsbyproxy.com' },
			phone: { value: '+1.4806242599' },
			address1: { value: '14747 N Northsight Blvd' },
			address2: { value: 'Suite 111, PMB 309' },
			city: { value: 'Scottsdale' },
			state: { value: 'AZ' },
			postalCode: { value: '85260' },
			countryCode: { value: 'US' }
		};
	},

	render: function() {
		let privacyPrice = this.translate( '%(cost)s per domain / year', { args: { cost: this.props.cost } } );
		if ( this.props.isFree ) {
			privacyPrice =
				<span className="privacy-free-text">
					{ this.translate( 'Free with your plan' ) }
				</span>;
		}

		return (
			<Dialog additionalClassNames="privacy-protection-dialog" isVisible={ this.props.isVisible } onClose={ this.props.onClose }>
				<header>
					<h1>{ this.translate( 'Why do I need Privacy Protection?' ) }</h1>
					<p>
						{ this.translate( 'Domains are required to have publicly accessible contact information.' ) }
						<span className="line-break">{ this.translate( 'With Privacy Protection, we show our partner\'s contact information instead of your own, helping to:' ) }</span>
					</p>
				</header>
				<ul className="privacy-features">
					<li>
						<h2>{ this.translate( 'Protect your identity online' ) }</h2>
					</li>
					<li>
						<h2>{ this.translate( 'Hide your email from spammers' ) }</h2>
					</li>
				</ul>
				<ul className="privacy-comparison">
					<li className="with-privacy">
						<h3>{ this.translate( 'With Privacy Protection' ) }</h3>
						<div className="privacy-price">
							{ privacyPrice }
						</div>
						<PrivacyProtectionExample
							countriesList= { this.props.countriesList }
							fields={ this.getProtectedFields() } />
						<button
								className="button is-primary"
								disabled={ this.props.disabled }
								onClick={ this.props.onSelect.bind( null, { addPrivacy: true } ) }>
							{ this.translate( 'Add Privacy Protection' ) }
						</button>
					</li>
					<li className="without-privacy">
						<h3>{ this.translate( 'Without Privacy Protection' ) }</h3>
						<div className="privacy-price">{ this.translate( 'No additional cost' ) }</div>
						<PrivacyProtectionExample
							countriesList= { this.props.countriesList }
							fields={ this.props.fields } />
						<button
								className="button"
								disabled={ this.props.disabled }
								onClick={ this.props.onSelect.bind( null, { addPrivacy: false } ) }>
							{ this.translate( 'Publish My Information' ) }
						</button>
					</li>
				</ul>
			</Dialog>
		);
	}
} );
