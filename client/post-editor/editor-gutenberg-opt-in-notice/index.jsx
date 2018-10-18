/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';

class EditorGutenbergOptInNotice extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		// isNoticeVisible: PropTypes.bool,
		dismissNotice: PropTypes.func,
		showDialog: PropTypes.func,
	};

	dismissNotice = () => {
		// this.props.hideNotice();
	};

	render() {
		const { translate, dismissNotice, showDialog } = this.props;
		return (
			<Notice
				className="editor-gutenberg-opt-in-notice"
				status="is-info"
				onDismissClick={ this.dismissNotice }
				text={ translate( 'A new editor is coming to level-up your layout.' ) }
			>
				<NoticeAction onClick={ showDialog }>{ translate( 'Learn More' ) }</NoticeAction>
			</Notice>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	// hideNotice: () => dispatch( hideGutenbergOptInDialog() ),
	showDialog: () => dispatch( showGutenbergOptInDialog() ),
} );

export default connect(
	state => {
		// const isDialogVisible = isGutenbergOptInDialogShowing( state );
		return {
			// showDialog: showGutenbergOptInDialog,
		};
	},
	mapDispatchToProps
)( localize( EditorGutenbergOptInNotice ) );
