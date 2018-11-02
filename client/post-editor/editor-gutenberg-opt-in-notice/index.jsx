/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

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
		showDialog: PropTypes.func,
	};

	state = {
		dismissed: false,
	};

	dismissNotice = () => this.setState( { dismissed: true } );

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		const { translate, showDialog } = this.props;

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

const mapDispatchToProps = { showDialog: showGutenbergOptInDialog };

export default connect(
	null,
	mapDispatchToProps
)( localize( EditorGutenbergOptInNotice ) );
