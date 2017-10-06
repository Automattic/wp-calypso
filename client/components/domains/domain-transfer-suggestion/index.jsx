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
import DomainSuggestion from 'components/domains/domain-suggestion';

class DomainTransferSuggestion extends React.Component {
	static propTypes = {
		onButtonClick: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;
		const buttonContent = translate( 'Use a domain I own', {
			context: 'Domain transfer or mapping suggestion button',
		} );

		return (
			<DomainSuggestion
				extraClasses="is-visible domain-transfer-suggestion"
				buttonContent={ buttonContent }
				onButtonClick={ this.props.onButtonClick }
				hidePrice={ true }
			>
				<div className="domain-transfer-suggestion__domain-description">
					<h3>
						{ translate( 'Already own a domain?', {
							context: 'Upgrades: Register domain header',
							comment:
								'Asks if you want to own a new domain (not if you want to map an existing domain).',
						} ) }
					</h3>
					<p>
						{ translate( "Transfer or map it to use it as your site's address.", {
							context: 'Upgrades: Register domain description',
							comment: "Explains how you could use a new domain name for your site's address.",
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
}

export default localize( DomainTransferSuggestion );
