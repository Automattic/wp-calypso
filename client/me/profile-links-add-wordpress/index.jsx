/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	FormButton = require( 'components/forms/form-button' ),
	Notice = require( 'components/notice' ),
	Site = require( 'blocks/site' ),
	sites = require( 'lib/sites-list' )(),
	eventRecorder = require( 'me/event-recorder' );

module.exports = React.createClass( {

	displayName: 'ProfileLinksAddWordPress',

	mixins: [ eventRecorder ],

	// an empty initial state is required to keep render and handleCheckedChange
	// code simpler / easier to maintain
	getInitialState: function() {
		return {};
	},

	handleCheckedChanged: function( event ) {
		var updates = {};
		updates[ event.target.name ] = event.target.checked;
		this.setState( updates );
	},

	onSelect: function( inputName, event ) {
		var updates = {};
		event.preventDefault();
		updates[ inputName ] = ! this.state[ inputName ];
		this.setState( updates );
	},

	getCheckedCount: function() {
		var inputName;
		var checkedCount = 0;
		for ( inputName in this.state ) {
			if ( this.state[ inputName ] ) {
				checkedCount++;
			}
		}
		return checkedCount;
	},

	onAddableSubmit: function( event ) {
		var links = [];
		var inputName, siteID, site;
		event.preventDefault();

		for ( inputName in this.state ) {
			if ( 'site-' === inputName.substr( 0, 5 ) && this.state[inputName] ) {
				siteID = parseInt( inputName.substr( 5 ), 10 ); // strip leading "site-" from inputName to get siteID
				site = sites.getSite( siteID );
				links.push( { title: site.name, value: site.URL } );
			}
		}

		this.props.userProfileLinks.addProfileLinks( links, this.onSubmitResponse );
	},

	onCancel: function( event ) {
		event.preventDefault();
		this.props.onCancel();
	},

	onCreateSite: function( event ) {
		event.preventDefault();
		window.open( config( 'signup_url' ) + '?ref=me-profile-links' );
		this.props.onCancel();
	},

	onJetpackMe: function( event ) {
		event.preventDefault();
		window.open( 'http://jetpack.me/' );
		this.props.onCancel();
	},

	onSubmitResponse: function( error, data ) {
		if ( error ) {
			this.setState(
				{
					lastError: this.translate( 'Unable to add any links right now. Please try again later.' )
				}
			);
			return;
		} else if ( data.malformed ) {
			this.setState(
				{
					lastError: this.translate( 'An unexpected error occurred. Please try again later.' )
				}
			);
			return;
		} else if ( data.duplicate ) {
			// our links are probably out of date, let's initiate a refresh of our parent
			this.props.userProfileLinks.fetchProfileLinks();
		}

		this.props.onSuccess();
	},

	clearLastError: function() {
		this.setState( { lastError: false } );
	},

	possiblyRenderError: function() {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
			<Notice
				className="profile-links-add-wordpress__error"
				status="is-error"
				onDismissClick={ this.clearLastError }>
				{ this.state.lastError }
			</Notice>
		);
	},

	renderAddableSites: function() {
		return (
			sites.getPublic().map( function( site ) {
				var inputName, checkedState;

				if ( this.props.userProfileLinks.isSiteInProfileLinks( site ) ) {
					return null;
				}

				inputName = 'site-' + site.ID;
				checkedState = this.state[ inputName ];

				return (
					<li key={ site.ID } className="profile-links-add-wordpress__item" onClick={ this.recordCheckboxEvent( 'Add WordPress Site' ) }>
						<input
							className="profile-links-add-wordpress__checkbox"
							type="checkbox"
							name={ inputName }
							onChange={ this.handleCheckedChanged }
							checked={ checkedState } />
						<Site
							site={ site }
							indicator={ false }
							onSelect={ this.onSelect.bind( this, inputName ) } />
					</li>
				);
			}.bind( this ) )
		);
	},

	renderAddableSitesForm: function() {
		var checkedCount = this.getCheckedCount();

		return (
			<form className="profile-links-add-wordpress" onSubmit={ this.onAddableSubmit }>
				<p>
					{ this.translate( 'Please select one or more sites to add to your profile.' ) }
				</p>
				<ul className="profile-links-add-wordpress__list">
					{ this.renderAddableSites() }
				</ul>
				{ this.possiblyRenderError() }
				<FormButton
					disabled={ ( 0 === checkedCount ) ? true : false }
					onClick={ this.recordClickEvent( 'Add WordPress Sites Button' ) }
				>
					{ this.translate( 'Add Site', 'Add Sites', { count: checkedCount } ) }
				</FormButton>
				<FormButton
					className="profile-links-add-wordpress__cancel"
					isPrimary={ false }
					onClick={ this.recordClickEvent( 'Cancel Add WordPress Sites Button', this.onCancel ) }
				>
					{ this.translate( 'Cancel' ) }
				</FormButton>
			</form>
		);
	},

	renderInvitationForm: function() {
		return (
			<form>
				<p>
					{
						this.translate(
							'You have no public sites on WordPress.com yet, but if you like you ' +
							'can create one now.  You may also add self-hosted WordPress ' +
							'sites here after installing {{jetpackLink}}Jetpack{{/jetpackLink}} on them.',
							{
								components: {
									jetpackLink: <a href="#" className="profile-links-add-wordpress__jetpack-link" onClick={ this.recordClickEvent( 'Jetpack Link in Profile Links', this.onJetpackMe ) }/>
								}
							}
						)
					}
				</p>
				<FormButton
					onClick={ this.recordClickEvent( 'Create Sites Button in Profile Links', this.onCreateSite ) }
					>
					{ this.translate( 'Create Site' ) }
				</FormButton>
				<FormButton
					className="profile-links-add-wordpress__cancel"
					isPrimary={ false }
					onClick={ this.recordClickEvent( 'Cancel Add WordPress Sites Button', this.onCancel ) }
				>
					{ this.translate( 'Cancel' ) }
				</FormButton>
			</form>
		);
	},

	render: function() {
		return (
			<div>
				{ 0 === sites.getPublic().length ? this.renderInvitationForm() : this.renderAddableSitesForm() }
			</div>
		);
	}
} );
