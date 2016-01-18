/**
 * External depencencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { setEditorMediaEditItem } from 'state/ui/editor/media/actions';
import Dialog from 'components/dialog';

const EditorMediaAdvanced = React.createClass( {
	propTypes: {
		item: PropTypes.object,
		resetEditItem: PropTypes.func,
		insertMedia: PropTypes.func
	},

	getDefaultProps() {
		return {
			resetEditItem: () => {},
			insertMedia: () => {}
		};
	},

	getButtonSettings() {
		return [
			{
				action: 'confirm',
				label: this.translate( 'Save' ),
				isPrimary: true,
				onClick: () => this.props.insertMedia( 'Updated' )
			}
		];
	},

	render() {
		const { item, resetEditItem } = this.props;

		return (
			<Dialog
				isVisible={ !! item }
				buttons={ this.getButtonSettings() }
				onClose={ resetEditItem }>
				ID { item && item.media.ID }
			</Dialog>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			item: state.ui.editor.media.editItem
		};
	},
	( dispatch ) => {
		return {
			resetEditItem: () => dispatch( setEditorMediaEditItem( null ) )
		};
	}
)( EditorMediaAdvanced );
