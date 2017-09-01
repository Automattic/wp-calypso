/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class DisconnectSurvey extends Component {
	state = {
		reasonSelected: 'onlyNeedFree',
		compactButtons: false,
		renderFull: false,
	};

	renderFull() {
		// placeholder
		return <div>{ ' follow-up QA' }</div>;
	}

	logReason = option => {
		this.setState( {
			reasonSelected: option.value,
			renderFull: true,
		} );
	};

	render() {
		const { translate, siteSlug } = this.props;
		const { reasonSelected, compactButtons, renderFull } = this.state;

		const textShareWhy =
			translate( 'Would you mind sharing why you want to' + ' disconnect ' ) +
			`${ siteSlug }` +
			translate( ' from WordPress.com ' );

		const options = [
			{ value: 'onlyNeedFree', label: 'This plan is too expensive' },
			{ value: 'tooHard', label: 'It was too hard to configure Jetpack' },
			{
				value: 'didNotInclude',
				label: 'This plan didn’t include what I needed',
			},
		];

		return (
			<div className="disconnect-site__survey main">
				<div className="disconnect-site__question">{ textShareWhy }</div>
				<SelectDropdown
					compact={ compactButtons }
					onSelect={ this.logReason }
					options={ options }
				/>
				{ renderFull ? this.renderFull( reasonSelected ) : null }
			</div>
		);
	}
}

export default connect( state => ( {
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectSurvey ) );
