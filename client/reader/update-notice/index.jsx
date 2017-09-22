/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors';

class UpdateNotice extends React.PureComponent {
	static propTypes = {
		count: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func,
		// connected props
		cappedUnreadCount: React.PropTypes.string,
	};

	static defaultProps = { onClick: noop };

	render() {
		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': this.props.count > 0,
		} );

		return (
			<div className={ counterClasses } onClick={ this.handleClick }>
				<DocumentHead unreadCount={ this.props.count } />
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.props.translate( '%s new post', '%s new posts', {
					args: [ this.props.cappedUnreadCount ],
					count: this.props.count,
				} ) }
			</div>
		);
	}

	handleClick = event => {
		event.preventDefault();
		this.props.onClick();
	};
}

export default connect( state => ( {
	cappedUnreadCount: getDocumentHeadCappedUnreadCount( state ),
} ) )( localize( UpdateNotice ) );
