/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import NpsSurvey from 'blocks/nps-survey';
import notices from 'notices';
import { setNpsSurveyDialogShowing } from 'state/ui/nps-survey-notice/actions';
import { isNpsSurveyDialogShowing } from 'state/ui/nps-survey-notice/selectors';

class NpsSurveyNotice extends Component {
	componentDidMount() {
		const options = {
			button: 'Sure!',
			onClick: ( event, closeFn ) => {
				closeFn();
				this.props.setNpsSurveyDialogShowing( true );
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
		this.props.setNpsSurveyDialogShowing( false );
	}

	handleSurveyDismissed = () => {
		this.handleDialogClose();
	}

	render() {
		return (
			<Dialog isVisible={ this.props.isNpsSurveyDialogShowing } onClose={ this.handleDialogClose }>
				<NpsSurvey
					name="global-notice-radio-buttons-v1"
					onDismissed={ this.handleSurveyDismissed }
				/>
			</Dialog>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isNpsSurveyDialogShowing: isNpsSurveyDialogShowing( state ),
	};
};

export default connect( mapStateToProps, { setNpsSurveyDialogShowing } )( NpsSurveyNotice );
