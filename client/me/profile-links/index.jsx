/**
 * External dependencies
 */
var React = require( 'react' ),
	times = require( 'lodash/times' );

/**
 * Internal dependencies
 */
var ProfileLink = require( 'me/profile-link' ),
	observe = require( 'lib/mixins/data-observe' ),
	AddProfileLinksButtons = require( 'me/profile-links/add-buttons' ),
	SectionHeader = require( 'components/section-header' ),
	Card = require( 'components/card' ),
	Notice = require( 'components/notice' ),
	eventRecorder = require( 'me/event-recorder' ),
	ProfileLinksAddWordPress = require( 'me/profile-links-add-wordpress' ),
	ProfileLinksAddOther = require( 'me/profile-links-add-other' );

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
			lastError: false,
			showPopoverMenu: false
		};
	},

	showAddWordPress: function() {
		this.setState( { showingForm: 'wordpress', showPopoverMenu: false } );
	},

	showAddOther: function() {
		this.setState( { showingForm: 'other', showPopoverMenu: false } );
	},

	showPopoverMenu: function() {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu
		} );
	},

	closePopoverMenu: function() {
		this.setState( { showPopoverMenu: false } );
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

	possiblyRenderError: function() {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
				<Notice className="profile-links__error"
					status="is-error"
					onDismissClick={ this.clearLastError }>
					{ this.translate( 'An error occurred while attempting to remove the link. Please try again later.' ) }
				</Notice>
		);
	},

	renderProfileLinksList: function() {
		return (
			<ul className="profile-links__list">
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

	renderPlaceholders: function() {
		return (
			<ul className="profile-links__list">
				{ times( 2, function( index ) {
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
			</ul>
		);
	},

	renderProfileLinks() {
		let links,
			initialized = this.props.userProfileLinks.initialized,
			countLinks = this.props.userProfileLinks.getProfileLinks().length;

		if ( ! initialized ) {
			links = this.renderPlaceholders();
		} else {
			links = countLinks > 0 ? this.renderProfileLinksList() : this.renderNoProfileLinks();
		}

		return (
			<div>
				<p>
					{ this.translate( 'Manage which sites appear in your profile.' ) }
				</p>

				{ this.possiblyRenderError() }
				{ links }
			</div>
		);
	},

	renderForm() {
		if ( 'wordpress' === this.state.showingForm ) {
			return (
				<ProfileLinksAddWordPress
					userProfileLinks={ this.props.userProfileLinks }
					onSuccess={ this.hideForms }
					onCancel={ this.hideForms }
				/>
			);
		}

		return (
			<ProfileLinksAddOther
				userProfileLinks={ this.props.userProfileLinks }
				onSuccess={ this.hideForms }
				onCancel={ this.hideForms }
			/>
		);
	},

	render: function() {
		return(
			<div>
				<SectionHeader label={ this.translate( 'Profile Links' ) }>
					<AddProfileLinksButtons
						userProfileLinks={ this.props.userProfileLinks }
						showingForm={ !! this.state.showingForm }
						onShowAddOther={ this.showAddOther }
						showPopoverMenu={ this.state.showPopoverMenu }
						onShowAddWordPress={ this.showAddWordPress }
						onShowPopoverMenu={ this.showPopoverMenu }
						onClosePopoverMenu={ this.closePopoverMenu }/>
				</SectionHeader>
				<Card>
					{ !! this.state.showingForm ? this.renderForm() : this.renderProfileLinks() }
				</Card>
			</div>
		);
	}
} );
