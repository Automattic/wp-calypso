/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, flow, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isPostRevisionsDialogVisible } from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import EditorRevisions from 'post-editor/editor-revisions';
import Dialog from 'components/dialog';
import LoadButton from 'post-editor/editor-revisions-list/load-button';

class PostRevisionsDialog extends PureComponent {
	static propTypes = {
		onClose: PropTypes.func,

		// connected to state
		isVisible: PropTypes.bool.isRequired,

		// connected to dispatch
		recordTracksEvent: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
	};

	componentWillMount() {
		this.toggleBodyClass( { isVisible: this.props.isVisible } );
	}

	componentWillUpdate( { isVisible } ) {
		this.toggleBodyClass( { isVisible } );
	}

	toggleBodyClass( { isVisible } ) {
		if ( ! ( typeof document === 'object' && get( document, 'body.classList' ) ) ) {
			return;
		}

		const bodyClassName = 'showing-post-revisions-dialog';
		isVisible
			? document.body.classList.add( bodyClassName )
			: document.body.classList.remove( bodyClassName );
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_editor_post_revisions_open' );
	}

	render() {
		const { isVisible, onClose, translate } = this.props;
		const dialogButtons = [
			{ action: 'cancel', compact: true, label: translate( 'Cancel' ) },
			<LoadButton />,
		];

		return (
			<Dialog
				buttons={ dialogButtons }
				className="editor-revisions__dialog"
				isVisible={ isVisible }
				onClose={ onClose }
			>
				<EditorRevisions />
			</Dialog>
		);
	}
}

export default flow(
	localize,
	connect(
		state => ( {
			isVisible: isPostRevisionsDialogVisible( state ),
		} ),
		{ recordTracksEvent }
	)
)( PostRevisionsDialog );
