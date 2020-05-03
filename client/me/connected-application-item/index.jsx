/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ConnectedApplicationIcon from 'me/connected-application-icon';
import FoldableCard from 'components/foldable-card';
import { withLocalizedMoment } from 'components/localized-moment';
import safeProtocolUrl from 'lib/safe-protocol-url';
import { deleteConnectedApplication } from 'state/connected-applications/actions';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ConnectedApplicationItem extends React.Component {
	static defaultProps = {
		isPlaceholder: false,
	};

	state = {
		showDetail: false,
	};

	recordClickEvent = ( action, label = null ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action, label );
	};

	getClickHandler = ( action ) => {
		return () => this.recordClickEvent( action );
	};

	disconnect = ( event ) => {
		if ( this.props.isPlaceholder ) {
			return;
		}

		const {
			connection: { title, ID },
		} = this.props;
		event.stopPropagation();
		this.recordClickEvent( 'Disconnect Connected Application Link', title );
		this.props.deleteConnectedApplication( ID );
	};

	renderAccessScopeBadge() {
		const {
			connection: { scope, site },
		} = this.props;
		let meta = '';

		if ( ! this.props.connection ) {
			return;
		}

		if ( 'auth' === scope ) {
			meta = this.props.translate( 'Authentication' );
		} else if ( 'global' === scope ) {
			meta = this.props.translate( 'Global' );
		} else if ( site ) {
			meta = site.site_name;
		}

		if ( meta.length ) {
			return <span className="connected-application-item__meta">{ meta }</span>;
		}
	}

	renderScopeMessage() {
		const {
			connection: { scope, site },
		} = this.props;
		let message;
		if ( ! this.props.connection ) {
			return;
		}

		if ( 'global' === scope ) {
			message = this.props.translate(
				'This connection is allowed to manage all of your blogs on WordPress.com, ' +
					'including any Jetpack blogs that are connected to your WordPress.com account.'
			);
		} else if ( 'auth' === scope ) {
			message = this.props.translate(
				'This connection is not allowed to manage any of your blogs.'
			);
		} else if ( false !== site ) {
			message = this.props.translate(
				'This connection is only allowed to access {{siteLink}}%(siteName)s{{/siteLink}}',
				{
					components: {
						siteLink: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								href={ safeProtocolUrl( this.props.connection.site.site_URL ) }
								onClick={ this.getClickHandler( 'Connected Application Scope Blog Link' ) }
							/>
						),
					},
					args: {
						siteName: site.site_name,
					},
				}
			);
		}

		if ( ! message ) {
			return;
		}

		return (
			<div>
				<h2>
					{ this.props.translate( 'Access Scope' ) }
					{ this.renderAccessScopeBadge() }
				</h2>

				<p className="connected-application-item__connection-detail-description">{ message }</p>
			</div>
		);
	}

	renderDetail() {
		const {
			connection: { URL, authorized, permissions },
		} = this.props;
		if ( this.props.isPlaceholder ) {
			return;
		}

		return (
			<div>
				<h2>{ this.props.translate( 'Application Website' ) }</h2>
				<p>
					<a
						href={ safeProtocolUrl( URL ) }
						onClick={ this.getClickHandler( 'Connected Application Website Link' ) }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ safeProtocolUrl( URL ) }
					</a>
				</p>

				{ this.props.translate(
					'{{detailTitle}}Authorized On{{/detailTitle}}{{detailDescription}}%(date)s{{/detailDescription}}',
					{
						components: {
							// eslint-disable-next-line jsx-a11y/heading-has-content
							detailTitle: <h2 />,
							detailDescription: (
								<p className="connected-application-item__connection-detail-description" />
							),
						},
						args: {
							date: this.props.moment( authorized ).format( 'lll' ),
						},
					}
				) }
				<div>{ this.renderScopeMessage() }</div>

				<h2>{ this.props.translate( 'Access Permissions' ) }</h2>
				<ul className="connected-application-item__connection-detail-descriptions">
					{ permissions.map( ( { name, description } ) => (
						<li key={ `permission-${ name }` }>{ description }</li>
					) ) }
				</ul>
			</div>
		);
	}

	renderHeader() {
		return (
			<div className="connected-application-item__header">
				<ConnectedApplicationIcon image={ this.props.connection.icon } />
				<h3>{ this.props.connection.title }</h3>
			</div>
		);
	}

	renderSummary() {
		return (
			<div>
				{ this.props.isPlaceholder ? (
					<Button compact disabled>
						{ this.props.translate( 'Loading…' ) }
					</Button>
				) : (
					<Button compact onClick={ this.disconnect }>
						{ this.props.translate( 'Disconnect' ) }
					</Button>
				) }
			</div>
		);
	}

	render() {
		const classes = classNames( {
			'connected-application-item': true,
			'is-placeholder': this.props.isPlaceholder,
		} );

		return (
			<FoldableCard
				header={ this.renderHeader() }
				summary={ this.renderSummary() }
				expandedSummary={ this.renderSummary() }
				clickableHeader
				compact
				className={ classes }
			>
				{ this.renderDetail() }
			</FoldableCard>
		);
	}
}

export default connect( null, {
	deleteConnectedApplication,
	recordGoogleEvent,
} )( localize( withLocalizedMoment( ConnectedApplicationItem ) ) );
