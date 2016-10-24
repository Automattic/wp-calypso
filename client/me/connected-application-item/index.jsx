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
import analytics from 'lib/analytics';
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';

export default React.createClass( {

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

	disconnect: function( event ) {
		if ( this.props.isPlaceholder ) {
			return;
		}
		const { connection: { title, ID } } = this.props;
		event.stopPropagation();
		analytics.ga.recordEvent( 'Me', 'Clicked on Disconnect Connected Application Link', title );
		this.props.revoke( ID );
	},

	renderAccessScopeBadge: function() {
		const { connection: { scope, site } } = this.props;
		var meta = '';

		if ( ! this.props.connection ) {
			return;
		}

		if ( 'auth' === scope ) {
			meta = this.translate( 'Authentication' );
		} else if ( 'global' === scope ) {
			meta = this.translate( 'Global' );
		} else if ( site ) {
			meta = site.site_name;
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
		const { connection: { scope, site } } = this.props;
		var message;
		if ( ! this.props.connection ) {
			return;
		}

		if ( 'global' === scope ) {
			message = this.translate(
				'This connection is allowed to manage all of your blogs on WordPress.com, ' +
				'including any Jetpack blogs that are connected to your WordPress.com account.'
			);
		} else if ( 'auth' === scope ) {
			message = this.translate(
				'This connection is not allowed to manage any of your blogs.'
			);
		} else if ( false !== site ) {
			message = this.translate(
				'This connection is only allowed to access {{siteLink}}%(siteName)s{{/siteLink}}', {
					components: {
						siteLink: <a
							target="_blank"
							rel="noopener noreferrer"
							href={ safeProtocolUrl( this.props.connection.site.site_URL ) }
							onClick={ this.recordClickEvent( 'Connected Application Scope Blog Link' ) }
						/>
					},
					args: {
						siteName: site.site_name
					}
				}
			);
		}

		if ( ! message ) {
			return;
		}

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
	},

	renderDetail: function() {
		const { connection: { URL, authorized, permissions } } = this.props;
		if ( this.props.isPlaceholder ) {
			return;
		}

		return (
			<div>
				<h2>{ this.translate( 'Application Website' ) }</h2>
				<p>
					<a
						href={ safeProtocolUrl( URL ) }
						onClick={ this.recordClickEvent( 'Connected Application Website Link' ) }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ safeProtocolUrl( URL ) }
					</a>
				</p>

				{ this.translate( '{{detailTitle}}Authorized On{{/detailTitle}}{{detailDescription}}%(date)s{{/detailDescription}}', {
					components: {
						detailTitle: <h2 />,
						detailDescription: <p className="connected-application-item__connection-detail-description" />
					},
					args: {
						date: this.moment( authorized ).format( 'MMM D, YYYY @ h:mm a' )
					}
				} ) }
				<div>
					{ this.renderScopeMessage() }
				</div>

				<h2>
					{ this.translate( 'Access Permissions' ) }
				</h2>
				<ul className="connected-application-item__connection-detail-descriptions">
					{ permissions.map( ( { name, description } ) => (
						<li key={ `permission-${ name }` }>
							{ description }
						</li>
					) ) }
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
		return(
			<div>
				{ this.props.isPlaceholder
					? ( <Button compact disabled>{ this.translate( 'Loading…' ) }</Button> )
					: ( <Button compact onClick={ this.disconnect }>{ this.translate( 'Disconnect' ) }</Button> )
				}
			</div> );
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
