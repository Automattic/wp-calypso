import PropTypes from 'prop-types';
import { Component } from 'react';

const noop = () => {};

export class SoftwareApplicationSchema extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		disabled: false,
		onChange: noop,
	};

	constructor( props ) {
		super( props );
	}

	render() {
		const structuredDataText = JSON.stringify( {
			'@context': 'http://schema.org',
			'@type': 'SoftwareApplication',
			applicationCategory: 'SecurityApplication',
			name: 'Jetpack',
			url: 'https://cloud.jetpack.com/pricing',
			offers: {
				'@type': 'AggregateOffer',
				offeredBy: {
					'@type': 'Organization',
					name: 'Automattic',
				},
				highPrice: '0.00',
				lowPrice: '0.00',
				offerCount: '1',
				priceCurrency: 'USD',
				priceSpecification: [
					{
						'@type': 'UnitPriceSpecification',
						price: '0.00',
						priceCurrency: 'USD',
						name: 'Jetpack Free',
					},
				],
			},
			creator: {
				'@type': 'Organization',
				'@id': 'https://automattic.com/#organization',
				url: 'https://automattic.com/',
				name: 'Automattic',
				logo: {
					'@type': 'ImageObject',
					url:
						'https://automattic.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo-2x.png',
				},
			},
		} );

		// Inject the script like this temporarily, in order to see whether or not
		// Google can read JSON+LD data when its dynamically injected into the
		// page contents.
		const script = document.createElement( 'script' );
		script.setAttribute( 'type', 'application/ld+json' );
		script.textContent = structuredDataText;
		document.head.appendChild( script );

		return null;
	}
}
