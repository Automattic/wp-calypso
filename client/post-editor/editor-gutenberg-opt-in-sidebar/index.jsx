/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import isGutenbergOptInEnabled from 'state/selectors/is-gutenberg-opt-in-enabled';

/**
 * Style dependencies
 */
import './style.scss';

class EditorGutenbergOptInSidebar extends PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		// connected properties
		showDialog: PropTypes.func,
		optInEnabled: PropTypes.bool,
	};

	handleKeyPress = ( event ) => {
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
				<p>{ translate( 'Try the new block editor and level up your layout.' ) }</p>
				<Button tabIndex="-1">{ translate( 'Learn more' ) }</Button>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	optInEnabled: isGutenbergOptInEnabled( state, getSelectedSiteId( state ) ),
} );

const mapDispatchToProps = { showDialog: showGutenbergOptInDialog };

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EditorGutenbergOptInSidebar ) );
