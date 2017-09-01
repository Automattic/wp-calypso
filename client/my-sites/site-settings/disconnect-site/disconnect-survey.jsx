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
	constructor( props ) {
		super( props );
		const initialState = {
			reasonSelected: 'missingFeature',
			compactButtons: false,
			renderFull: false,
		};

		this.state = initialState;
	}

	renderFull = () => {
		// placeholder
		return (
			<div>
				{' '}
				{ ' follow-up selectable' }{' '}
			</div>
		);
	};

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
			translate( ' from Wordpress.com ' );

		const options = [
			{ value: 'missingFeature', label: 'Jetpack is missing a feature' },
			{ value: 'reason2', label: "I'm going to use WordPress somewhere else" },
			{
				value: 'reason3',
				label: "I'm going to use a different service for " + 'my website or blog.',
			},
			{
				value: 'reason4',
				label: "I'm going to use a different service for " + 'my website or blog.',
			},
			{ value: 'reason5', label: 'I no longer need a website or blog.' },
			{ value: 'reason6', label: 'Another reason.' },
			{ value: 'reason7', label: 'I found a better plugin or service.' },
			{ value: 'reason8', label: "I'm moving my site off of WordPress." },
		];

		return (
			<div className="disconnect-site__survey main">
				<div className="disconnect-site__question">
					{ textShareWhy }
				</div>
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
