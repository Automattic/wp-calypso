/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import isGutenbergOptInEnabled from 'state/selectors/is-gutenberg-opt-in-enabled';

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
		sidebarOpen: PropTypes.bool,
		dismissNotice: PropTypes.func,
	};

	constructor( props ) {
		super( props );
		this.state = { hasOpenedSidebar: false };
	}

	static getDerivedStateFromProps( props, state ) {
		if ( ! state.hasOpenedSidebar && props.sidebarOpen ) {
			return { hasOpenedSidebar: true };
		}
		return null;
	}

	dismissNotice = () => this.props.dismissNotice( 'gutenberg_nudge_notice_dismissed', true );

	render() {
		if (
			! this.props.optInEnabled ||
			this.props.noticeDismissed ||
			this.state.hasOpenedSidebar ||
			isMobile()
		) {
			return null;
		}

		const { translate, showDialog } = this.props;

		return (
			<Notice
				className="editor-gutenberg-opt-in-notice"
				status="is-info"
				onDismissClick={ this.dismissNotice }
				text={ translate( 'Try the new block editor and level up your layout.' ) }
			>
				<NoticeAction onClick={ showDialog }>{ translate( 'Learn More' ) }</NoticeAction>
			</Notice>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	optInEnabled: isGutenbergOptInEnabled( state, getSelectedSiteId( state ) ),
	noticeDismissed: getPreference( state, 'gutenberg_nudge_notice_dismissed' ),
	sidebarOpen: 'open' === getPreference( state, 'editor-sidebar' ),
} );

const mapDispatchToProps = {
	showDialog: showGutenbergOptInDialog,
	dismissNotice: savePreference,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EditorGutenbergOptInNotice ) );
