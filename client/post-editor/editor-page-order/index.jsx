/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import isNaN from 'lodash/isNaN';

/**
 * Internal dependencies
 */
import TextInput from 'components/forms/form-text-input';
import postActions from 'lib/posts/actions';
import { recordEvent, recordStat } from 'lib/posts/stats';

export default React.createClass( {
	displayName: 'EditorPageOrder',

	mixins: [ PureRenderMixin ],

	propTypes: {
		menuOrder: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.string
		] )
	},

	getDefaultProps() {
		return {
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
