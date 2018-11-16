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
	};

	state = {
		dismissed: false,
	};

	dismissNotice = () => this.setState( { dismissed: true } );

	render() {
		if ( ! this.props.optInEnabled ) {
			return null;
		}

		if ( this.state.dismissed ) {
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
} );

const mapDispatchToProps = { showDialog: showGutenbergOptInDialog };

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EditorGutenbergOptInNotice ) );
