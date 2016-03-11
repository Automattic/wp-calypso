/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import isNaN from 'lodash/isNaN';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import TextInput from 'components/forms/form-text-input';
import postActions from 'lib/posts/actions';
import { recordEvent, recordStat } from 'lib/posts/stats';
import { setMenuOrder } from 'state/ui/editor/post/actions';
import { getSelectedSiteId, getCurrentEditedPostId } from 'state/ui/selectors';

const EditorPageOrder = React.createClass( {
	displayName: 'EditorPageOrder',

	mixins: [ PureRenderMixin ],

	propTypes: {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		setMenuOrder: PropTypes.func,
		menuOrder: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.string
		] )
	},

	getDefaultProps() {
		return {
			siteId: null,
			postId: null,
			setMenuOrder: () => {},
			menuOrder: 0
		};
	},

	updateMenuOrder( event ) {
		let newOrder = parseInt( event.target.value );

		if ( isNaN( newOrder ) ) {
			newOrder = '';
		}

		this.editMenuOrder( newOrder );
	},

	validateMenuOrder( event ) {
		let newOrder = parseInt( event.target.value );

		if ( isNaN( newOrder ) ) {
			newOrder = 0;
		}

		this.editMenuOrder( newOrder );
	},

	editMenuOrder( newOrder ) {
		if ( newOrder !== this.props.menuOrder ) {
			recordStat( 'advanced_menu_order_changed' );
			recordEvent( 'Changed page menu order' );

			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			postActions.edit( {
				menu_order: newOrder
			} );
			this.props.setMenuOrder( this.props.siteId, this.props.postId, newOrder );
		}
	},

	render() {
		return (
			<div className="editor-page-order">
				<label>
					<span className="editor-page-order__label-text">{ this.translate( 'Order', { context: 'Editor: Field label for page menu order.' } ) }</span>
					<TextInput value={ this.props.menuOrder } onChange={ this.updateMenuOrder } onBlur={ this.validateMenuOrder } />
				</label>
			</div>
		);
	}
} );

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		postId: getCurrentEditedPostId( state )
	} ),
	dispatch => bindActionCreators( { setMenuOrder }, dispatch )
)( EditorPageOrder );
