/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import NpsSurvey from 'blocks/nps-survey';
import notices from 'notices';

class NpsSurveyNotice extends Component {
	state = {
		showDialog: false,
	}

	componentDidMount() {
		const options = {
			button: 'Sure!',
			onClick: ( event, closeFn ) => {
				closeFn();
				this.setState( {
					showDialog: true
				} );
			}
		};

		// wait a little bit before showing the notice, so that
		// (1) the user gets a chance to look briefly at the uncluttered screen, and
		// (2) the user notices the notice more, since it will cause a change to the
		//     screen they are already looking at
		setTimeout( () => {
			notices.new( 'Let us know how we are doing...', options, 'is-info' );
		}, 2000 );
	}

	handleDialogClose = () => {
		// TODO: detect if survey was never submitted
		this.setState( {
			showDialog: false
		} );
	}

	handleSurveyDismissed = () => {
		this.handleDialogClose();
	}

	render() {
		return (
			<Dialog isVisible={ this.state.showDialog } onClose={ this.handleDialogClose }>
				<NpsSurvey
					name="global-notice-radio-buttons-v1"
					onDismissed={ this.handleSurveyDismissed }
				/>
			</Dialog>
		);
	}
}

export default NpsSurveyNotice;
