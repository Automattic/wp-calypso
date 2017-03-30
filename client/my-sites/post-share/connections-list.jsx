/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

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

	hasConnections() {
		return !! get( this.props, 'connections.length' );
	}

	renderEmptyPlaceholder() {
		return (
			<div className="post-share__main">
				<div className="post-share__form is-placeholder" />
				<div className="post-share__services is-placeholder" />
			</div>
		);
	}

	renderWarnings() {
		const {
			connections,
			hasFetchedConnections,
			siteSlug,
			translate,
		} = this.props;

		if ( ! hasFetchedConnections || ! this.hasConnections() ) {
			return null;
		}

		return (
			<div>
				{ connections
					.filter( connection => connection.status === 'broken' )
					.map( connection => <Notice
						key={ connection.keyring_connection_ID }
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'There is an issue connecting to %s.', { args: connection.label } ) }
					>
						<NoticeAction href={ `/sharing/${ siteSlug }` }>
							{ translate( 'Reconnect' ) }
						</NoticeAction>
					</Notice> )
				}
			</div>
		);
	}

	render() {
		const { connections, onToggle, siteId } = this.props;

		if ( ! siteId || ! this.hasConnections() ) {
			return null;
		}

		if ( ! this.props.hasFetchedConnections ) {
			return this.renderEmptyPlaceholder();
		}

		return (
			<div className="post-share__connections">
				{ this.renderWarnings() }

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
