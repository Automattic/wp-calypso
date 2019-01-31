/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import isGutenbergEnabled from 'state/selectors/is-gutenberg-enabled';
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class EditorGutenbergOptInNotice extends Component {
	static propTypes = {
		translate: PropTypes.func,
		// connected properties
		showDialog: PropTypes.func,
		optInEnabled: PropTypes.bool,
		noticeDismissed: PropTypes.bool,
		dismissNotice: PropTypes.func,
	};

	dismissNotice = () => this.props.dismissNotice( 'gutenberg_nudge_notice_dismissed', true );

	render() {
		if ( ! this.props.optInEnabled || this.props.noticeDismissed ) {
			return null;
		}

		const { translate, showDialog } = this.props;

		return (
			<Notice
				className="editor-gutenberg-opt-in-notice"
				status="is-info"
				onDismissClick={ this.dismissNotice }
				text={ translate( 'A new editor is coming to level up your layout.' ) }
			>
				<NoticeAction onClick={ showDialog }>{ translate( 'Learn More' ) }</NoticeAction>
			</Notice>
		);
	}
}

const mapStateToProps = state => ( {
	optInEnabled:
		isEnabled( 'gutenberg/opt-in' ) && isGutenbergEnabled( state, getSelectedSiteId( state ) ),
	noticeDismissed: getPreference( state, 'gutenberg_nudge_notice_dismissed' ),
} );

const mapDispatchToProps = {
	showDialog: showGutenbergOptInDialog,
	dismissNotice: savePreference,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EditorGutenbergOptInNotice ) );
