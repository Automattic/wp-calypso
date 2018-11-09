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
import { isEnabled } from 'config';
import { isJetpackSite } from 'state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import { getSelectedSiteId } from 'state/ui/selectors';
import { abtest } from 'lib/abtest';

class EditorGutenbergOptInNotice extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
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
				text={ translate( 'A new editor is coming to level-up your layout.' ) }
			>
				<NoticeAction onClick={ showDialog }>{ translate( 'Learn More' ) }</NoticeAction>
			</Notice>
		);
	}
}

const mapDispatchToProps = { showDialog: showGutenbergOptInDialog };

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const isVip = isVipSite( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	return {
		optInEnabled:
			isEnabled( 'gutenberg/opt-in' ) &&
			! isJetpack &&
			! isVip &&
			abtest( 'calypsoifyGutenberg' ) === 'yes',
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EditorGutenbergOptInNotice ) );
