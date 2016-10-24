/**
 * External dependencies
 */
const React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
const Card = require( 'components/card' ),
	CompactCard = require( 'components/card/compact' ),
	Gridicon = require( 'components/gridicon' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormRadio = require( 'components/forms/form-radio' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	AuthorSelector = require( 'blocks/author-selector' ),
	UsersActions = require( 'lib/users/actions' ),
	Gravatar = require( 'components/gravatar' ),
	accept = require( 'lib/accept' ),
	analytics = require( 'lib/analytics' );

module.exports = React.createClass( {
	displayName: 'DeleteUser',

	mixins: [ PureRenderMixin ],

	propTypes: {
		isMultisite: React.PropTypes.bool.isRequired,
		isJetpack: React.PropTypes.bool.isRequired,
		siteId: React.PropTypes.number.isRequired,
		user: React.PropTypes.object.isRequired,
		currentUser: React.PropTypes.object.isRequired,
	},

	getInitialState: function() {
		return {
			showDialog: false,
			radioOption: false,
			reassignUser: false
		};
	},

	getRemoveText: function() {
		if ( ! this.props.user || ! this.props.user.name ) {
			return this.translate( 'Remove User' );
		}

		return this.translate( 'Remove %(username)s', {
			args: {
				username: this.props.user.name,
			}
		} );
	},

	getDeleteText: function() {
		if ( ! this.props.user || ! this.props.user.name ) {
			return this.translate( 'Delete User' );
		}

		return this.translate( 'Delete %(username)s', {
			args: {
				username: this.props.user.name,
			}
		} );
	},

	handleRadioChange: function( event ) {
		let name = event.currentTarget.name,
			value = event.currentTarget.value,
			updateObj = {};

		updateObj[ name ] = value;

		this.setState( updateObj );
		analytics.ga.recordEvent( 'People', 'Selected Delete User Assignment', 'Assign', value );
	},

	onSelectAuthor: function( author ) {
		this.setState( {
			reassignUser: author
		} );
	},

	removeUser: function() {
		accept( (
			<div>
				<p>
				{
					this.props.user && this.props.user.name ?
					this.translate(
						'If you remove %(username)s, that user will no longer be able to access this site, ' +
						'but any content that was created by %(username)s will remain on the site.', {
							args: {
								username: this.props.user.name
							}
						}
					) :
					this.translate(
						'If you remove this user, he or she will no longer be able to access this site, ' +
						'but any content that was created by this user will remain on the site.'
					)
				}
				</p>
				<p>
					{ this.translate( 'Would you still like to remove this user?' ) }
				</p>
			</div>
			),
			accepted => {
				if ( accepted ) {
					analytics.ga.recordEvent( 'People', 'Clicked Confirm Remove User on Edit User Network Site' );
					UsersActions.deleteUser( this.props.siteId, this.props.user.ID );
				} else {
					analytics.ga.recordEvent( 'People', 'Clicked Cancel Remove User on Edit User Network Site' );
				}
			},
			this.translate( 'Remove' )
		);
		analytics.ga.recordEvent( 'People', 'Clicked Remove User on Edit User Network Site' );
	},

	deleteUser: function( event ) {
		event.preventDefault();
		if ( ! this.props.user.ID ) {
			return;
		}

		let reassignUserId;
		if ( this.state.reassignUser && 'reassign' === this.state.radioOption ) {
			reassignUserId = this.state.reassignUser.ID;
		}

		UsersActions.deleteUser( this.props.siteId, this.props.user.ID, reassignUserId );
		analytics.ga.recordEvent( 'People', 'Clicked Remove User on Edit User Single Site' );
	},

	getAuthorSelectPlaceholder: function() {
		return (
			<span className="delete-user__select-placeholder">
				{ this.translate( 'select a user' ) }
			</span>
		);
	},

	getTranslatedAssignLabel: function() {
		return this.translate( 'Attribute all content to {{AuthorSelector/}}', {
			components: {
				AuthorSelector: (
					<AuthorSelector
						allowSingleUser
						siteId={ this.props.siteId }
						onSelect={ this.onSelectAuthor }
						exclude={ [ this.props.user.ID ] }
					>
						{
							this.state.reassignUser ?
							<span>
								<Gravatar size={ 26 } user={ this.state.reassignUser } />
								<span className="delete-user__reassign-user-name">
									{ this.state.reassignUser.name }
								</span>
							</span> :
							this.getAuthorSelectPlaceholder()
						}
					</AuthorSelector>
				)
			}
		} );
	},

	isDeleteButtonDisabled: function() {
		if ( 'reassign' === this.state.radioOption ) {
			return false === this.state.reassignUser || this.state.reassignUser.ID === this.props.user.ID;
		}

		return false === this.state.radioOption;
	},

	renderSingleSite: function() {
		return (
			<Card className="delete-user">
				<form onSubmit={ this.deleteUser }>
					<FormSectionHeading>
						{ this.getDeleteText() }
					</FormSectionHeading>

					<p className="delete-user__explanation">
						{
							this.props.user.name ?
							this.translate(
								'You have the option of reassigning all content created by ' +
								'%(username)s, or deleting the content entirely.', {
									args: {
										username: this.props.user.name,
									}
								}
							) :
							this.translate(
								'You have the option of reassigning all content created by ' +
								'this user, or deleting the content entirely.'
							)
						}
					</p>

					<FormFieldset>
						<FormLabel>
							<FormRadio
								name="radioOption"
								onChange={ this.handleRadioChange }
								value="reassign"
								checked={ 'reassign' === this.state.radioOption }
							/>

							<span>
								{ this.getTranslatedAssignLabel() }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								name="radioOption"
								onChange={ this.handleRadioChange }
								value="delete"
								checked={ 'delete' === this.state.radioOption }
							/>

							<span>
								{
									this.props.user.name ?
									this.translate(
										'Delete all content created by %(username)s', {
											args: {
												username: this.props.user.name ? this.props.user.name : '',
											}
										}
									) :
									this.translate(
										'Delete all content created by this user'
									)
								}
							</span>
						</FormLabel>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton disabled={ this.isDeleteButtonDisabled() } >
							{ this.translate( 'Delete user', { context: 'Button label' } ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</Card>
		);
	},

	renderMultisite: function() {
		return (
			<CompactCard className="delete-user" >
				<a className="edit-team-member-form__remove-user" onClick={ this.removeUser }>
					<Gridicon icon="trash" />
					{ this.getRemoveText() }
				</a>
			</CompactCard>
		);
	},

	render: function() {
		// A user should not be able to remove themself.
		if ( ! this.props.isJetpack && this.props.user.ID === this.props.currentUser.ID ) {
			return null;
		}
		if ( this.props.isJetpack && this.props.user.linked_user_ID === this.props.currentUser.ID ) {
			return null;
		}

		return this.props.isMultisite ? this.renderMultisite() : this.renderSingleSite();
	}
} );
