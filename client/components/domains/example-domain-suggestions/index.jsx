/**
 * External dependencies
 */
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import wpcom from 'lib/wp';
import PremiumPopover from 'components/plans/premium-popover';

module.exports = React.createClass( {
	displayName: 'ExampleDomainSuggestions',
	propTypes: {
		domainsWithPlansOnly: React.PropTypes.bool.isRequired
	},

	getInitialState: function() {
		return {
			exampleDomainSuggestionsData: [
				{
					domain_name: 'example.wordpress.com',
					cost: 0
				},
				{
					domain_name: 'example.com',
				}
			]
		};
	},

	componentWillMount: function() {
		wpcom.undocumented().exampleDomainSuggestions( function( errors, response ) {
			if ( response ) {
				this.setState( {
					exampleDomainSuggestionsData: response
				} );
			}
		}.bind( this ) );
	},

	costDisplay: function( cost ) {
		if ( cost === undefined ) {
			return this.translate( 'Loading…' );
		}

		if ( cost === 0 ) {
			return this.translate( 'Free' );
		}

		if ( cost && this.props.domainsWithPlansOnly ) {
			return (
				<span className="example-domain-suggestions__premium-price" ref="premiumPrice">
					<PremiumPopover
						position="bottom left"
						textLabel={ this.translate( 'Included in WordPress.com Premium' ) }/>
				</span>
			);
		}

		return this.translate( 'Starting at %(cost)s {{small}}/ year{{/small}}', {
			args: {
				cost: cost
			},
			components: {
				small: <small />
			}
		} );
	},

	getExampleSuggestions: function() {
		return this.state.exampleDomainSuggestionsData.map( example => {
			const classes = classNames( 'example-domain-suggestions__price', {
				'is-free': 0 === example.cost
			} );

			return (
				<li key={ example.domain_name }>
					<div>{ example.domain_name }</div>
					<div className={ classes }>{ this.costDisplay( example.cost ) }</div>
				</li>
			);
		} );
	},

	handleClickMappingLink: function() {
		analytics.tracks.recordEvent( 'calypso_example_domain_suggestions_mapping_link_click' );
	},

	render: function() {
		let mappingInformation;

		if ( ! isEmpty( this.props.products ) ) {
			const components = {
				mappingLink: <a onClick={ this.handleClickMappingLink } href={ this.props.mapDomainUrl } />,
				strong: <strong />
			};
			if ( this.props.domainsWithPlansOnly ) {
				mappingInformation = this.translate(
					'{{strong}}Already own a domain?{{/strong}} {{mappingLink}}Map it{{/mappingLink}} with WordPress.com' +
					' Premium.',
					{ components }
				);
			} else {
				mappingInformation = this.translate(
					'{{strong}}Already own a domain?{{/strong}} ' +
					'{{mappingLink}}Map it{{/mappingLink}} for %(mappingCost)s.', {
						args: {
							mappingCost: this.props.products.domain_map.cost_display
						},
						components
					}
				);
			}
		} else {
			mappingInformation = this.translate( 'Loading…' );
		}

		return (
			<div className="example-domain-suggestions">
				<p className="example-domain-suggestions__explanation">A domain name is what people type into their browser to visit your site.</p>
				<p className="example-domain-suggestions__mapping-information">
					{ mappingInformation }
				</p>
				<div className="example-domain-suggestions__browser">
					<svg width="295" height="102" viewBox="0 0 295 102" xmlns="http://www.w3.org/2000/svg"><title>Example Browser</title><g fill="none" fill-rule="evenodd"><path fill="#E9EFF3" d="M0 49h295v53H0z"/><path d="M295 50V0H8.005C3.585 0 0 3.576 0 8.006V50h295z" fill="#C8D7E1"/><rect fill="#E9EFF3" opacity=".8" x="10" y="10" width="30" height="30" rx="4"/><rect fill="#E9EFF3" opacity=".8" x="50" y="10" width="30" height="30" rx="4"/><path d="M295 10H94c-2.21 0-4 1.79-4 4v22c0 2.213 1.79 4 4 4h201V10z" fill="#F3F6F8"/><text font-family="SFUIText-Regular, SF UI Text" font-size="15"><tspan x="101" y="30" fill="#87A6BC">http://</tspan> <tspan x="144.828" y="30" fill="#3D596D">example.com</tspan></text></g></svg>
				</div>
			</div>
		);
	}
} );
