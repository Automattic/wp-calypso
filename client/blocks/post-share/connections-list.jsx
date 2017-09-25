/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Connection from './connection';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class ConnectionsList extends PureComponent {
	static propTypes = {
		connections: PropTypes.array,
		onToggle: PropTypes.func,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,

		// connects and helpers
		moment: PropTypes.func,
		numberFormat: PropTypes.func,
		translater: PropTypes.func,
	};

	static defaultProps = {
		connections: [],
	};

	renderEmptyPlaceholder() {
		return (
			<div className="post-share__main">
				<div className="post-share__form is-placeholder" />
				<div className="post-share__services is-placeholder" />
			</div>
		);
	}

	render() {
		const { connections, onToggle, siteId } = this.props;

		if ( ! siteId || ! connections.length ) {
			return null;
		}

		if ( ! this.props.hasFetchedConnections ) {
			return this.renderEmptyPlaceholder();
		}

		return (
			<div className="post-share__connections">
				{ connections.map( connection =>
					<Connection { ...{
						connection,
						onToggle,
						isActive: connection.isActive,
						key: connection.keyring_connection_ID,
					} }
					/>
				) }
			</div>
		);
	}
}

export const NoConnectionsNotice = ( { siteSlug, translate } ) => (
	<Notice
		status="is-warning"
		showDismiss={ false }
		text={ translate( 'Connect an account to get started.' ) }
	>
		<NoticeAction href={ `/sharing/${ siteSlug }` }>
			{ translate( 'Settings' ) }
		</NoticeAction>
	</Notice>
);

export default localize( ConnectionsList );
