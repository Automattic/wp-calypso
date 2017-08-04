/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SelectDropdown from 'components/select-dropdown';
import PaginationFlow from './pagination-flow';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import DisconnectReasonsSuggestion from './disconnect-reasons-suggestion';

class DisconnectReasonsMenu extends Component {
	constructor( props ) {
		super( props );
		const initialState = {
			childSelected: 'missingFeature',
			compactButtons: false,
			renderFull: false
		};

		this.state = initialState;
		this._logReason = this._logReason.bind( this );
	}

	displayFull = ( option ) => {
		return (
			<DisconnectReasonsSuggestion
				optionSelected={ option }
				compactButtons={ this.state.compactButtons } />
		);
	}

	_logReason = ( option ) => {
		this.setState( {
			childSelected: option.value,
			renderFull: true
		} );
	}

	render() {
		const {
			translate,
			siteSlug
				} = this.props;
		const {
			childSelected,
			compactButtons,
			renderFull
		} = this.state;

		const textShareWhy = translate( 'Would you mind sharing why you want to' +
			' disconnect ' ) + `${ siteSlug }` + translate( ' from Wordpress.com ' );

		const options = [
			{ value: 'missingFeature', label: 'Jetpack is missing a feature' },
			{ value: 'reason2', label: 'I\'m going to use WordPress somewhere else' },
			{ value: 'reason3', label: 'I\'m going to use a different service for ' +
				'my website or blog.' },
			{ value: 'reason4', label: 'I\'m going to use a different service for ' +
					'my website or blog.' },
			{ value: 'reason5', label: 'I no longer need a website or blog.' },
			{ value: 'reason6', label: 'Another reason.' },
			{ value: 'reason7', label: 'I found a better plugin or service.' },
			{ value: 'reason8', label: 'I\'m moving my site off of WordPress.' },
		];

		return (
			<div>
				<div className="disconnect-site why__card">
					<Card>
						<div className="why__card question why"> { textShareWhy } </div>
						<SelectDropdown
								compact={ compactButtons }
								onSelect={ this._logReason }
								options={ options }
						/>
						{ renderFull
							? this.displayFull( childSelected )
							: null }
					</Card>
			</div>
			<PaginationFlow />
		</div>
		);
	}
}

export default connect(
	( state ) => ( {
		siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( DisconnectReasonsMenu ) );
