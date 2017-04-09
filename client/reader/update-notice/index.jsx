/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-pure-render/mixin';
import { noop } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors';

const UpdateNotice = React.createClass( {
	mixins: [ PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func,
		// connected props
		cappedUnreadCount: React.PropTypes.string
	},

	getDefaultProps: function() {
		return { onClick: noop };
	},

	render: function() {
		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': this.props.count > 0
		} );

		return (
			<div className={ counterClasses } onClick={ this.handleClick } >
				<DocumentHead unreadCount={ this.props.count } />
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.translate( '%s new post', '%s new posts', { args: [ this.props.cappedUnreadCount ], count: this.props.count } ) }
			</div>
		);
	},

	handleClick: function( event ) {
		event.preventDefault();
		this.props.onClick();
	}
} );

export default connect(
	state => ( {
		cappedUnreadCount: getDocumentHeadCappedUnreadCount( state )
	} )
)( UpdateNotice );
