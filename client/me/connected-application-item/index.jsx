/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:connected-application-item' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
import eventRecorder from 'me/event-recorder';
import ConnectedApplicationIcon from 'me/connected-application-icon';
import safeProtocolUrl from 'lib/safe-protocol-url';
import analytics from 'analytics';
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';

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
		var meta = '';

		if ( ! this.props.connection ) {
			return;
		}

		if ( 'auth' === this.props.connection.scope ) {
			meta = this.translate( 'Authentication' );
		} else if ( 'global' === this.props.connection.scope ) {
			meta = this.translate( 'Global' );
		} else if ( this.props.connection.site ) {
			meta = this.props.connection.site.site_name;
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
		var message;
		if ( ! this.props.connection ) {
			return;
		}

		if ( 'global' === this.props.connection.scope ) {
			message = this.translate(
				'This connection is allowed to manage all of your blogs on WordPress.com, ' +
				'including any Jetpack blogs that are connected to your WordPress.com account.'
			);
		} else if ( 'auth' === this.props.connection.scope ) {
			message = this.translate(
				'This connection is not allowed to manage any of your blogs.'
			);
		} else if ( false !== this.props.connection.site ) {
			message = this.translate(
				'This connection is only allowed to access {{siteLink}}%(siteName)s{{/siteLink}}', {
					components: {
						siteLink: <a
							target="_blank"
							href={ safeProtocolUrl( this.props.connection.site.site_URL ) }
							onClick={ this.recordClickEvent( 'Connected Application Scope Blog Link' ) }
						/>
					},
					args: {
						siteName: this.props.connection.site.site_name
					}
				}
			);
		}

		if ( message ) {
			return (
				<div>
					<h2>
						{ this.translate( 'Access Scope' ) }
						{ this.renderAccessScopeBadge() }
					</h2>

					<p className="connected-application-item__connection-detail-description" >
						{ message }
					</p>
				</div>
			);
		}
	},

	renderDetail: function() {
		if ( this.props.isPlaceholder ) {
			return;
		}

		return (
			<div>
				<h2>
					{ this.translate( 'Application Website' ) }
				</h2>
				<p>
					<a
						href={ safeProtocolUrl( this.props.connection.URL ) }
						onClick={ this.recordClickEvent( 'Connected Application Website Link' ) }
						target="_blank"
					>
						{ safeProtocolUrl( this.props.connection.URL ) }
					</a>
				</p>

				{ this.translate( '{{detailTitle}}Authorized On{{/detailTitle}}{{detailDescription}}%(date)s{{/detailDescription}}', {
					components: {
						detailTitle: <h2 />,
						detailDescription: <p className="connected-application-item__connection-detail-description" />
					},
					args: {
						date: this.moment( this.props.connection.authorized ).format( 'MMM D, YYYY @ h:mm a' )
					}
				} ) }
				<p>
					{ this.renderScopeMessage() }
				</p>

				<h2>
					{ this.translate( 'Access Permissions' ) }
				</h2>
				<ul className="connected-application-item__connection-detail-descriptions">
					{ this.props.connection.permissions.map( function( permission ) {
						return (
							<li key={ 'permission-' + permission.name } >
								{ permission.description }
							</li>
						);
					}, this ) }
				</ul>
			</div>
		);
	},

	header: function() {
		return (
			<div className="connected-application-item__header">
				<ConnectedApplicationIcon image={ this.props.connection.icon } />
				<h3>{ this.props.connection.title }</h3>
			</div>
		);
	},

	summary: function() {
		return( <div>{ this.props.isPlaceholder
			? ( <Button compact disabled>{ this.translate( 'Loading…' ) }</Button> )
			: ( <Button compact onClick={ this.disconnect }>{ this.translate( 'Disconnect' ) }</Button> ) }</div> );
	},

	render: function() {
		let classes = classNames( {
			'connected-application-item': true,
			'is-placeholder': this.props.isPlaceholder
		} );

		return (
			<FoldableCard
				header={ this.header() }
				summary={ this.summary() }
				expandedSummary={ this.summary() }
				clickableHeader
				compact
				className={ classes }>
				{ this.renderDetail() }
			</FoldableCard>
		);
	},
} );
