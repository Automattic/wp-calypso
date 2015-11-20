/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:connected-application-item' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var eventRecorder = require( 'me/event-recorder' ),
	CompactCard = require( 'components/card/compact' ),
	ConnectedApplicationIcon = require( 'me/connected-application-icon' ),
	safeProtocolUrl = require( 'lib/safe-protocol-url' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {

	displayName: 'ConnectedApplicationItem',

	mixins: [ eventRecorder ],

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	},

	getInitialState: function() {
		return {
			showDetail: false
		};
	},

	getDefaultProps: function() {
		return {
			isPlaceholder: false
		};
	},

	toggleDetail: function() {
		if ( this.state.showDetail ) {
			analytics.ga.recordEvent( 'Me', 'Collapsed Connected Application', this.props.connection.title );
		} else {
			analytics.ga.recordEvent( 'Me', 'Expanded Connected Application', this.props.connection.title );
		}

		this.setState( { showDetail: ! this.state.showDetail } );
	},

	disconnect: function( event ) {
		if ( this.props.isPlaceholder ) {
			return;
		}
		event.stopPropagation();
		analytics.ga.recordEvent( 'Me', 'Clicked on Disconnect Connected Application Link', this.props.connection.title );
		this.props.revoke( this.props.connection.ID );
	},

	renderAccessScopeBadge: function() {
		var meta = '',
			connection = this.props.connection;

		if ( ! connection ) {
			return;
		}

		if ( 'auth' === connection.scope ) {
			meta = this.translate( 'Authentication' );
		} else if ( 'global' === connection.scope ) {
			meta = this.translate( 'Global' );
		} else if ( connection.site ) {
			meta = connection.site.site_name;
		}

		if ( meta.length ) {
			return (
				<span className="connected-application-item__meta">
					{ meta }
				</span>
			);
		}
	},

	renderScopeMessage: function() {
		var message,
			connection = this.props.connection;

		if ( ! connection ) {
			return;
		}

		if ( 'global' === connection.scope ) {
			message = this.translate(
				'This connection is allowed to manage all of your blogs on WordPress.com, ' +
				'including any Jetpack blogs that are connected to your WordPress.com account.'
			);
		} else if ( 'auth' === connection.scope ) {
			message = this.translate(
				'This connection is not allowed to manage any of your blogs.'
			);
		} else if ( false !== connection.site ) {
			message = this.translate(
				'This connection is only allowed to access {{siteLink}}%(siteName)s{{/siteLink}}', {
					components: {
						siteLink: <a
							target="_blank"
							href={ safeProtocolUrl( connection.site.site_URL ) }
							onClick={ this.recordClickEvent( 'Connected Application Scope Blog Link' ) }
						/>
					},
					args: {
						siteName: connection.site.site_name
					}
				}
			);
		}

		if ( message ) {
			return (
				<li className="connected-application-item__connection-detail">
					<strong className="connected-application-item__connection-detail-title">
						{ this.translate( 'Access Scope' ) }
						{ this.renderAccessScopeBadge() }
					</strong>

					<span className="connected-application-item__connection-detail-description" >
						{ message }
					</span>
				</li>
			);
		}
	},

	renderDetail: function() {
		var connection = this.props.connection;
		if ( this.props.isPlaceholder ) {
			return;
		}

		return (
			<div className="connected-application-item__content">
				<p className="connected-application-item__content-description">
					{ connection.description }
				</p>
				<ul className="connected-application-item__ul">
					<li className="connected-application-item__connection-detail">
						<strong className="connected-application-item__connection-detail-title">
							{ this.translate( 'Application Website' ) }
						</strong>

						<span className="connected-application-item__connection-detail-description">
							<a
								href={ safeProtocolUrl( connection.URL ) }
								onClick={ this.recordClickEvent( 'Connected Application Website Link' ) }
								target="_blank"
							>
								{ safeProtocolUrl( connection.URL ) }
							</a>
						</span>
					</li>

					<li className="connected-application-item__connection-detail">
						{
							this.translate( '{{detailTitle}}Authorized On{{/detailTitle}}{{detailDescription}}%(date)s{{/detailDescription}}', {
								components: {
									detailTitle: <strong className="connected-application-item__connection-detail-title" />,
									detailDescription: <span className="connected-application-item__connection-detail-description" />
								},
								args: {
									date: this.moment( connection.authorized ).format( 'MMM D, YYYY @ h:mm a' )
								}
							} )
						}
					</li>

					{ this.renderScopeMessage() }

					<li className="connected-application-item__connection-detail">
						<strong className="connected-application-item__connection-detail-title">
							{ this.translate( 'Access Permissions' ) }
						</strong>

						{ connection.permissions.map( function( permission ) {
							return (
								<span
									className="connected-application-item__connection-detail-description"
									key={ 'permission-' + permission.name } >
									{ permission.description }
								</span>
							);
						}, this ) }
					</li>
				</ul>
			</div>
		);
	},

	render: function() {
		var connection = this.props.connection,
			classes = classNames( {
				'connected-application-item': true,
				'is-open': this.state.showDetail,
				'is-placeholder': this.props.isPlaceholder
			} ),
			noticonClasses = classNames( {
				'connected-application-item__content-toggle': true,
				noticon: true,
				'noticon-collapse': this.state.showDetail,
				'noticon-expand': ! this.state.showDetail
			} );

		return (
			<CompactCard className={ classes }>
				<div className="connected-application-item__header" onClick={ this.toggleDetail }>
					<span className={ noticonClasses }></span>
					<ConnectedApplicationIcon image={ connection.icon } />

					<div className="connected-application-item__title">
						{ connection.title }
					</div>

					<span className="connected-application-item__disconnect">
						<a onClick={ this.disconnect } className="button">
							{ this.translate( 'Disconnect' ) }
						</a>
					</span>
				</div>
				{ this.renderDetail() }
			</CompactCard>
		);
	},
} );
