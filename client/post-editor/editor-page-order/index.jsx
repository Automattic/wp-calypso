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
import AccordionSection from 'client/components/accordion/section';
import TextInput from 'client/components/forms/form-text-input';
import { recordEvent, recordStat } from 'client/lib/posts/stats';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getEditedPostValue } from 'client/state/posts/selectors';
import { editPost } from 'client/state/posts/actions';

class EditorPageOrder extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		menuOrder: PropTypes.number,
	};

	static defaultProps = {
		menuOrder: 0,
	};

	constructor() {
		super( ...arguments );

		this.editMenuOrder = this.editMenuOrder.bind( this );
		this.statTracked = false;
	}

	editMenuOrder( event ) {
		const { menuOrder, siteId, postId } = this.props;
		const newOrder = parseInt( event.target.value, 10 ) || 0;
		if ( newOrder === menuOrder ) {
			return;
		}

		if ( ! this.statTracked ) {
			this.statTracked = true;
			recordStat( 'advanced_menu_order_changed' );
			recordEvent( 'Changed page menu order' );
		}

		this.props.editPost( siteId, postId, { menu_order: newOrder } );
	}

	render() {
		const { translate, menuOrder } = this.props;

		return (
			<AccordionSection className="editor-page-order">
				<label>
					<span className="editor-page-order__label-text">
						{ translate( 'Order', { context: 'Editor: Field label for menu order.' } ) }
					</span>
					<TextInput
						type="number"
						value={ menuOrder }
						pattern="[0-9]*"
						onChange={ this.editMenuOrder }
						onBlur={ this.editMenuOrder }
						className="editor-page-order__input"
					/>
				</label>
			</AccordionSection>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const menuOrder = getEditedPostValue( state, siteId, postId, 'menu_order' );

		return { siteId, postId, menuOrder };
	},
	{ editPost }
)( localize( EditorPageOrder ) );
