/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors/';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';

class EditorGutenbergOptInSidebar extends PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		showDialog: PropTypes.func,
	};

	handleKeyPress = event => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			this.props.showDialog();
		}
	};

	render() {
		const { showDialog, translate, optInEnabled } = this.props;

		if ( ! optInEnabled ) {
			return null;
		}

		return (
			<div
				tabIndex="0"
				role="button"
				className="editor-gutenberg-opt-in-sidebar"
				onClick={ showDialog }
				onKeyPress={ this.handleKeyPress }
			>
				<img src="/calypso/images/illustrations/gutenberg-mini.svg" alt="" />
				<p>{ translate( 'Try our new editor and level-up your layout.' ) }</p>
				<Button tabIndex="-1">{ translate( 'Learn more' ) }</Button>
			</div>
		);
	}
}

EditorGutenbergOptInSidebar.propTypes = {
	// connected properties
	translate: PropTypes.func,
	showDialog: PropTypes.func,
	optInEnabled: PropTypes.bool,
};

const mapStateToProps = state => ( {
	optInEnabled: isCalypsoifyGutenbergEnabled( state, getSelectedSiteId( state ) ),
} );

export default connect(
	mapStateToProps,
	{
		showDialog: showGutenbergOptInDialog,
	}
)( localize( EditorGutenbergOptInSidebar ) );
