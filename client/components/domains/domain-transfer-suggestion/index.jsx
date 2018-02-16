/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
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

		const props = config.isEnabled( 'domains/kracken-ui' )
			? {
					buttonProps: { borderless: true },
					extraClasses: 'is-visible domain-transfer-suggestion is-kracken-ui',
					showChevron: true,
				}
			: {};

		return (
			<DomainSuggestion
				extraClasses="is-visible domain-transfer-suggestion"
				buttonContent={ buttonContent }
				onButtonClick={ this.props.onButtonClick }
				tracksButtonClickSource={ this.props.tracksButtonClickSource }
				hidePrice={ true }
				{ ...props }
			>
				<div className="domain-transfer-suggestion__domain-description">
					<h3>
						{ translate( 'Already own a domain?', {
							context: 'Upgrades: Register domain header',
							comment: 'Asks if you already own a domain name.',
						} ) }
					</h3>
					<p>
						{ translate( "You can use it as your site's address.", {
							context: 'Upgrades: Register domain description',
							comment: 'Explains how you could use an existing domain name with your site.',
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
}

export default localize( DomainTransferSuggestion );
