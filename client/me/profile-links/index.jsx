/**
 * External dependencies
 */
var React = require( 'react' ),
	_times = require( 'lodash/utility/times' );

/**
 * Internal dependencies
 */
var ProfileLink = require( 'me/profile-link' ),
	observe = require( 'lib/mixins/data-observe' ),
	ProfileLinksAddWordPress = require( 'me/profile-links-add-wordpress' ),
	ProfileLinksAddOther = require( 'me/profile-links-add-other' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	eventRecorder = require( 'me/event-recorder' );

module.exports = React.createClass( {

	displayName: 'ProfileLinks',

	mixins: [ observe( 'userProfileLinks' ), eventRecorder ],

	componentDidMount: function() {
		this.props.userProfileLinks.getProfileLinks();
		if ( typeof document.hidden !== 'undefined' ) {
			document.addEventListener( 'visibilitychange', this.handleVisibilityChange );
		}
	},

	componentWillUnmount: function() {
		if ( typeof document.hidden !== 'undefined' ) {
			document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );
		}
	},

	handleVisibilityChange: function() {
		// if we're visible now, fetch the links again in case they
		// changed (added/removed) something while the component this tab
		// is on was hidden
		if ( ! document.hidden ) {
			this.props.userProfileLinks.fetchProfileLinks();
		}
	},

	getDefaultProps: function() {
		return {
			userProfileLinks: {
				initialized: false
			}
		};
	},

	getInitialState: function() {
		return {
			showingForm: false,
			lastError: false
		};
	},

	showAddWordPress: function( event ) {
		event.preventDefault();
		this.setState( { showingForm: 'wordpress' } );
	},

	showAddOther: function( event ) {
		event.preventDefault();
		this.setState( { showingForm: 'other' } );
	},

	hideForms: function() {
		this.setState( { showingForm: false } );
	},

	onRemoveLinkResponse: function( error ) {
		if ( error ) {
			this.setState( { lastError: error } );
		} else {
			this.setState( { lastError: false } );
		}
	},

	clearLastError: function() {
		this.setState( { lastError: false } );
	},

	onRemoveLink: function( profileLink ) {
		this.props.userProfileLinks.deleteProfileLinkBySlug( profileLink.link_slug, this.onRemoveLinkResponse );
	},

	renderFormVisibilityControls: function() {
		return (
			<FormButtonsBar>
				<FormButton onClick={ this.recordClickEvent( 'Add Other Site Button', this.showAddOther ) } isPrimary={ false } >
					{ this.translate( 'Add Other Site' ) }
				</FormButton>
				<FormButton onClick={ this.recordClickEvent( 'Add a WordPress Site Button', this.showAddWordPress ) } isPrimary={ false } >
					{ this.translate( 'Add a WordPress Site' ) }
				</FormButton>
			</FormButtonsBar>
		);
	},

	possiblyRenderError: function() {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
				<SimpleNotice className="profile-links__error"
					isCompact={ true }
					status="is-error"
					onClick={ this.clearLastError }>
					{ this.translate( 'An error occurred while attempting to remove the link. Please try again later.' ) }
				</SimpleNotice>
		);
	},

	renderProfileLinks: function() {
		return (
			<ul className="profile-links">
				{ this.props.userProfileLinks.getProfileLinks().map( function( profileLink ) {
					return (
						<ProfileLink
							key={ profileLink.link_slug }
							title={ profileLink.title }
							url={ profileLink.value }
							slug={ profileLink.link_slug }
							onRemoveLink={ this.onRemoveLink.bind( this, profileLink ) } />
					);
				}, this )
			}
			</ul>
		);
	},

	renderNoProfileLinks: function() {
		return (
			<p className="profile-links__no-links">
				{
					this.translate( 'You have no sites in your profile links. You may add sites if you\'d like.' )
				}
			</p>
		);
	},

	render: function() {
		// If userProfileLinks has not initialized, let's render some placeholder content
		if ( ! this.props.userProfileLinks.initialized ) {
			return (
				<div className="profile-links">
					{ _times( 2, function( index ) {
						return (
							<ProfileLink
								title="Loading Profile Links"
								url="http://wordpress.com"
								slug="A placeholder profile link"
								isPlaceholder
								key={ index }
							/>
						);
					} ) }
				</div>
			);
		}

		// If userProfileLinks has been initialized, then attempt to render profile links.
		return (
			<div className="profile-links">
				{ this.possiblyRenderError() }

				{
					this.props.userProfileLinks.getProfileLinks().length > 0
					? this.renderProfileLinks()
					: this.renderNoProfileLinks()
				}

				{
					'wordpress' === this.state.showingForm
					? (
						<ProfileLinksAddWordPress
							userProfileLinks={ this.props.userProfileLinks }
							onSuccess={ this.hideForms }
							onCancel={ this.hideForms }
						/>
					)
					: null
				}

				{
					'other' === this.state.showingForm
					? (
						<ProfileLinksAddOther
							userProfileLinks={ this.props.userProfileLinks }
							onSuccess={ this.hideForms }
							onCancel={ this.hideForms }
						/>
					)
					: null
				}

				{ ! this.state.showingForm ? this.renderFormVisibilityControls() : null }
		</div>
		);
	}
} );
