/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
const Card = require( 'components/card' ),
	CompactCard = require( 'components/card/compact' ),
	Gridicon = require( 'gridicons' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormRadio = require( 'components/forms/form-radio' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	AuthorSelector = require( 'blocks/author-selector' ),
	UsersActions = require( 'lib/users/actions' ),
	accept = require( 'lib/accept' ),
	analytics = require( 'lib/analytics' );
import Gravatar from 'components/gravatar';
import { localize } from 'i18n-calypso';

const DeleteUser = React.createClass( {
	displayName: 'DeleteUser',

	mixins: [ PureRenderMixin ],

	propTypes: {
		isMultisite: React.PropTypes.bool,
		isJetpack: React.PropTypes.bool,
		siteId: React.PropTypes.number,
		user: React.PropTypes.object,
		currentUser: React.PropTypes.object,
	},

	getInitialState: function() {
		return {
			showDialog: false,
			radioOption: false,
			reassignUser: false
		};
	},

	getRemoveText: function() {
		const { translate } = this.props;
		if ( ! this.props.user || ! this.props.user.name ) {
			return translate( 'Remove User' );
		}

		return translate( 'Remove %(username)s', {
			args: {
				username: this.props.user.name,
			}
		} );
	},

	getDeleteText: function() {
		const { translate } = this.props;
		if ( ! this.props.user || ! this.props.user.name ) {
			return translate( 'Delete User' );
		}

		return translate( 'Delete %(username)s', {
			args: {
				username: this.props.user.name,
			}
		} );
	},

	handleRadioChange: function( event ) {
		const name = event.currentTarget.name,
			value = event.currentTarget.value,
			updateObj = {};

		updateObj[ name ] = value;

		this.setState( updateObj );
		analytics.ga.recordEvent( 'People', 'Selected Delete User Assignment', 'Assign', value );
	},

	setReassignLabel( label ) {
		this.reassignLabel = label;
	},

	onSelectAuthor: function( author ) {
		this.setState( {
			reassignUser: author
		} );
	},

	removeUser: function() {
		const { translate } = this.props;
		accept( (
			<div>
				<p>
				{
					this.props.user && this.props.user.name
					? translate(
						'If you remove %(username)s, that user will no longer be able to access this site, ' +
						'but any content that was created by %(username)s will remain on the site.', {
							args: {
								username: this.props.user.name
							}
						}
					)
					: translate(
						'If you remove this user, he or she will no longer be able to access this site, ' +
						'but any content that was created by this user will remain on the site.'
					)
				}
				</p>
				<p>
					{ translate( 'Would you still like to remove this user?' ) }
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
			translate( 'Remove' )
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
		const { translate } = this.props;
		return (
			<span className="delete-user__select-placeholder">
				{ translate( 'select a user' ) }
			</span>
		);
	},

	getTranslatedAssignLabel: function() {
		const { translate } = this.props;
		return translate( 'Attribute all content to {{AuthorSelector/}}', {
			components: {
				AuthorSelector: (
					<AuthorSelector
						allowSingleUser
						siteId={ this.props.siteId }
						onSelect={ this.onSelectAuthor }
						exclude={ [ this.props.user.ID ] }
						ignoreContext={ this.reassignLabel }
					>
						{
							this.state.reassignUser
							? (
								<span>
									<Gravatar size={ 26 } user={ this.state.reassignUser } />
									<span className="delete-user__reassign-user-name">
										{ this.state.reassignUser.name }
									</span>
								</span>
							)
							: this.getAuthorSelectPlaceholder()
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
		const { translate } = this.props;
		return (
			<Card className="delete-user__single-site">
				<form onSubmit={ this.deleteUser }>
					<FormSectionHeading>
						{ this.getDeleteText() }
					</FormSectionHeading>

					<p className="delete-user__explanation">
						{
							this.props.user.name
							? translate(
								'You have the option of reassigning all content created by ' +
								'%(username)s, or deleting the content entirely.', {
									args: {
										username: this.props.user.name,
									}
								}
							)
							: translate(
								'You have the option of reassigning all content created by ' +
								'this user, or deleting the content entirely.'
							)
						}
					</p>

					<FormFieldset>
						<FormLabel ref={ this.setReassignLabel }>
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
									this.props.user.name
									? translate(
										'Delete all content created by %(username)s', {
											args: {
												username: this.props.user.name ? this.props.user.name : '',
											}
										}
									)
									: translate(
										'Delete all content created by this user'
									)
								}
							</span>
						</FormLabel>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton disabled={ this.isDeleteButtonDisabled() } >
							{ translate( 'Delete user', { context: 'Button label' } ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</Card>
		);
	},

	renderMultisite: function() {
		return (
			<CompactCard className="delete-user__multisite" >
				<a
					className="delete-user__remove-user"
					onClick={ this.removeUser }>
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

export default localize( DeleteUser );
