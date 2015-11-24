/**
 * External dependencies
 */
var React = require( 'react' ),
	Gridicon = require( 'components/gridicon' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Accordion = require( 'components/accordion' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	serviceConnections = require( 'my-sites/sharing/connections/service-connections' ),
	PostMetadata = require( 'lib/post-metadata' ),
	Sharing = require( './' ),
	AccordionSection = require( 'components/accordion/section' ),
	postUtils = require( 'lib/posts/utils' );

module.exports = React.createClass( {
	displayName: 'EditorSharingAccordion',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		connections: React.PropTypes.array,
		fetchConnections: React.PropTypes.func
	},

	getSubtitle: function() {
		var skipped, targeted;

		if ( this.props.site && (
				( this.props.site.jetpack && ! this.props.site.isModuleActive( 'publicize' ) ) ||
				this.props.site.options.publicize_permanently_disabled
		) ) {
			return;
		}

		if ( postUtils.isPage( this.props.post ) ) {
			return;
		}

		if ( ! this.props.post || ! this.props.connections ) {
			return this.translate( 'Loading…' );
		}

		skipped = PostMetadata.publicizeSkipped( this.props.post );
		targeted = this.props.connections.filter( function( connection ) {
			return -1 === skipped.indexOf( connection.keyring_connection_ID );
		} );

		return serviceConnections.getServicesFromConnections( targeted ).map( function( service ) {
			return service.label;
		} ).join( ', ' );
	},

	renderShortUrl: function() {
		var classes = classNames( 'editor-sharing__shortlink', {
			'is-standalone': this.hideSharing()
		} );

		if ( ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		return(
			<div className={ classes }>
				<label
					className="editor-sharing__shortlink-label"
					htmlFor="shortlink-field"
				>
					{ this.translate( 'Shortlink' ) }
				</label>
				<FormTextInput
					className="editor-sharing__shortlink-field"
					id="shortlink-field"
					value={ this.props.post.short_URL }
					size={ this.props.post.short_URL && this.props.post.short_URL.length }
					readOnly
					selectOnFocus
				/>
			</div>
		);
	},

	hideSharing: function() {
		return this.props.site &&
			this.props.site.jetpack &&
			! this.props.site.isModuleActive( 'publicize' ) &&
			! this.props.site.isModuleActive( 'sharedaddy' ) &&
			! this.props.site.isModuleActive( 'likes' );
	},

	render: function() {
		var hideSharing = this.hideSharing(),
			classes = classNames( 'editor-sharing__accordion', this.props.className, {
				'is-loading': ! this.props.post || ! this.props.connections
			} );

		// if sharing is hidden, and post is not published (no short URL yet),
		// then do not render this accordion
		if ( hideSharing && ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		return (
			<Accordion
				title={ this.translate( 'Sharing' ) }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="share" /> }
				className={ classes }>
				<AccordionSection>
					{ ! hideSharing && (
						<Sharing
							site={ this.props.site }
							post={ this.props.post }
							isNew={ this.props.isNew }
							connections={ this.props.connections }
							fetchConnections={ this.props.fetchConnections }
						/>
					) }
					{ this.renderShortUrl() }
				</AccordionSection>
			</Accordion>
		);
	}
} );
