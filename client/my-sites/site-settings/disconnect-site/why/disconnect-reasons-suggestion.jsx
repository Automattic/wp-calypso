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

class DisconnectReasonsSuggestion extends Component {
	constructor( props ) {
		super( props );
		const initialState = {
			childSelected: 'default',
			compactButtons: false,
		};
		this.state = initialState;
	}
	componentWillReceiveProps() {
		const state = {
			childSelected: 'default',
		};
		this.state = state;
	}

	_logReasonFollowUp = ( option ) => {
		this.setState( {
			childSelected: option.value,
		} );
	}
	setOptions = ( optionValue ) => {
		let options = [];
		switch ( optionValue ) {
			case 'missingFeature':
				options = [
					{ value: 'default', label: 'Backup' },
					{ value: 'missingFeature_followup_themes', label: 'Themes' },
					{ value: 'missingFeature_followup_other', label: 'Love :)' },
				];
				break;

			case 'reason2':
				options = [
				{ value: 'default', label: 'sth1' },
				{ value: 'reason2_followup_sth2', label: 'sth2' },
				{ value: 'reason2_followup_sth3', label: 'sth3' },
				];
				break;

			case 'reason3':
				options = [
				{ value: 'default', label: 'sth banana' },
				{ value: 'reason3_followup_sth2', label: 'sth2' },
				];
				break;

			case 'reason4':
				options = [
				{ value: 'default', label: 'sth1 reason4' },
				{ value: 'reason4_followup_sth2', label: 'sth2' },
				{ value: 'reason4_followup_sth3', label: 'sth3' },
				];
				break;

			case 'reason5':
				options = [
				{ value: 'default', label: 'sth reason5' },
				{ value: 'reason5_followup_sth2', label: 'sth2' },
				];
				break;

			case 'reason6':
				options = [
				{ value: 'default', label: 'sth1 reason6' },
				{ value: 'reason6_followup_sth2', label: 'sth2' },
				{ value: 'reason6_followup_sth3', label: 'sth3' },
				];
				break;

			case 'reason7':
				options = [
				{ value: 'default', label: 'sth reason7' },
				{ value: 'reason7_followup_sth2', label: 'sth2' },
				];
				break;

			case 'reason8':
				options = [
				{ value: 'default', label: 'sth reason8' },
				{ value: 'reason8_followup_sth2', label: 'sth2' },
				];
				break;
		}
		return options;
	}
	setQuestion = ( optionValue ) => {
		const {
			translate
		} = this.props;

		let textShareWhat =	'';
		switch ( optionValue ) {
			case 'missingFeature':
				textShareWhat = translate( 'What feature are you looking for?' );
				break;
			case 'reason2':
				textShareWhat = translate( 'Mind telling us where?' );
				break;
			case 'reason3':
				textShareWhat = translate( 'Mind telling us which one(s)?' );
				break;
			case 'reason4':
				textShareWhat = translate( 'What will you do instead?' );
				break;
			case 'reason5':
				textShareWhat = translate( 'Mind telling us which one(s)?' );
				break;
			case 'reason6':
				textShareWhat = translate( 'Mind sharing more?' );
				break;
			case 'reason7':
				textShareWhat = translate( 'Mind telling us which one(s)?' );
				break;
			case 'reason8':
				textShareWhat = translate( 'What will you do instead?' );
				break;
		}
		return textShareWhat;
	}
	render() {
		const {
			compactButtons,
			optionSelected
		} = this.props;
		const {
			childSelected
		} = this.state;

		const options = this.setOptions( optionSelected );
		return (
			<div>

				<div className="why__card question follow-up">
					{ this.setQuestion( optionSelected ) }
				</div>

				<div className="why__card dropdown">
					<SelectDropdown
							compact={ compactButtons }
							onSelect={ this._logReasonFollowUp }
							options={ options }
							selectedText={ childSelected.value }
							initialSelected= { childSelected }
					/>
				</div>

			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( DisconnectReasonsSuggestion ) );
