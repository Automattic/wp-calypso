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
import DomainSuggestion from 'components/domains/domain-suggestion';

class DomainSkipSuggestion extends React.Component {
	static propTypes = {
		onButtonClick: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;
		const buttonContent = translate( 'Skip Purchase', {
			context: 'Button for skipping domain purchase',
		} );

		return (
			<DomainSuggestion
				buttonContent={ buttonContent }
				buttonStyles={ { borderless: true } }
				extraClasses="is-visible domain-skip-suggestion"
				hidePrice={ true }
				onButtonClick={ this.props.onButtonClick }
				showChevron
				// tracksButtonClickSource={ this.props.tracksButtonClickSource }
			>
				<div className="domain-skip-suggestion__domain-description">
					<h3>{ this.props.selectedSiteSlug }</h3>
					<p>
						{ translate( 'This is your current free site address', {
							context: "Describes the user's currently selected site address",
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
}

export default localize( DomainSkipSuggestion );
