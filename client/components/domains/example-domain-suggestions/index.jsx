/**
 * External dependencies
 */
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import analytics from 'analytics';
import wpcom from 'lib/wp';
import { abtest } from 'lib/abtest';

module.exports = React.createClass( {
	displayName: 'ExampleDomainSuggestions',

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
		let examples, mappingInformation;
		const mappingUrl = this.props.path + '/mapping';

		if ( ! isEmpty( this.props.products ) ) {
			mappingInformation = this.translate(
				'{{strong}}Already own a domain?{{/strong}} ' +
				'{{mappingLink}}Map it{{/mappingLink}} for %(mappingCost)s.', {
					args: {
						mappingCost: this.props.products.domain_map.cost_display
					},

					components: {
						mappingLink: <a onClick={ this.handleClickMappingLink } href={ mappingUrl } />,
						strong: <strong />
					}
				}
			);
		} else {
			mappingInformation = this.translate( 'Loading…' );
		}

		examples = (
			<Card className="example-domain-suggestions">
				<div className="example-domain-suggestions__illustration" />
				<div className="example-domain-suggestions__information">
					<h2 className="example-domain-suggestions__header">
						{ this.translate( 'What are my options?' ) }
					</h2>
					<ul className="example-domain-suggestions__list">
						{ this.getExampleSuggestions() }
					</ul>
					<p className="example-domain-suggestions__mapping-information">
						{ mappingInformation }
					</p>
				</div>
			</Card>
		);

		return examples;
	}
} );
