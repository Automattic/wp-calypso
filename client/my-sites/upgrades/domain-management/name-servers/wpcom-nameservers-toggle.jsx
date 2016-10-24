/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
var Toggle = require( 'components/forms/form-toggle' ),
	support = require( 'lib/url/support' );
import analyticsMixin from 'lib/mixins/analytics';

const NameserversToggle = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'nameServers' ) ],

	propTypes: {
		onToggle: React.PropTypes.func.isRequired,
		enabled: React.PropTypes.bool.isRequired
	},

	render() {
		return (
			<div className="name-servers__dns is-compact card">
				<span className="name-servers__title">
					{ this.translate( 'Use WordPress.com Name Servers' ) }
				</span>

				<form className="name-servers__toggle">
					<Toggle
						id="wp-nameservers"
						name="wp-nameservers"
						onChange={ this.handleToggle }
						type="checkbox"
						checked={ this.props.enabled }
						value="active"/>
				</form>
				{ this.renderExplanation() }
			</div>
		);
	},

	handleToggle() {
		this.recordEvent(
			'wpcomNameServersToggleButtonClick',
			this.props.selectedDomainName,
			! this.props.enabled
		);

		this.props.onToggle();
	},

	renderExplanation() {
		if ( ! this.props.enabled ) {
			return null;
		}

		return (
			<p className="name-servers__explanation">
				{ this.translate(
					'Name servers point your domain to the right website host, like WordPress.com. ' +
					'{{a}}Learn more.{{/a}}',
					{
						components: {
							a: (
								<a href={ support.CHANGE_NAME_SERVERS }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.handleLearnMoreClick } />
							)
						}
					}
				) }
			</p>
		);
	},

	handleLearnMoreClick() {
		this.recordEvent( 'wpcomNameServersLearnMoreClick', this.props.selectedDomainName );
	}
} );

export default NameserversToggle;
