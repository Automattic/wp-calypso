/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Connection from './connection';

class ConnectionsList extends PureComponent {
	static propTypes = {
		connections: PropTypes.array,
		onToggle: PropTypes.func,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
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
				{ connections.map( ( connection ) => (
					<Connection
						{ ...{
							connection,
							onToggle,
							isActive: connection.isActive,
							key: connection.keyring_connection_ID,
						} }
					/>
				) ) }
			</div>
		);
	}
}

export default ConnectionsList;
