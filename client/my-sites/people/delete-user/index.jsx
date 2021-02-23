/* eslint-disable jsx-a11y/anchor-is-valid */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { connect, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card, Button, CompactCard } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import User from 'calypso/components/user';
import AuthorSelector from 'calypso/blocks/author-selector';
import accept from 'calypso/lib/accept';
import Gravatar from 'calypso/components/gravatar';
import { localize } from 'i18n-calypso';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import {
	requestExternalContributors,
	requestExternalContributorsRemoval,
} from 'calypso/state/data-getters';
import { httpData } from 'calypso/state/data-layer/http-data';
import useDeleteUser from 'calypso/data/users/delete-user';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

/**
 * Style dependencies
 */
import './style.scss';

class DeleteUser extends React.Component {
	static displayName = 'DeleteUser';

	static propTypes = {
		isMultisite: PropTypes.bool,
		isJetpack: PropTypes.bool,
		siteId: PropTypes.number,
		user: PropTypes.object,
		currentUser: PropTypes.object,
	};

	state = {
		showDialog: false,
		radioOption: false,
		reassignUser: false,
		authorSelectorToggled: false,
	};

	getRemoveText = () => {
		const { translate } = this.props;
		if ( ! this.props.user || ! this.props.user.name ) {
			return translate( 'Remove User' );
		}

		return translate( 'Remove %(username)s', {
			args: {
				username: this.props.user.name,
			},
		} );
	};

	getDeleteText = () => {
		const { translate } = this.props;
		if ( ! this.props.user || ! this.props.user.name ) {
			return translate( 'Delete User' );
		}

		return translate( 'Delete %(username)s', {
			args: {
				username: this.props.user.name,
			},
		} );
	};

	handleRadioChange = ( event ) => {
		const name = event.currentTarget.name;
		const value = event.currentTarget.value;
		const updateObj = {};

		updateObj[ name ] = value;

		if ( event.currentTarget.value === 'reassign' ) {
			this.setState( { authorSelectorToggled: true } );
		} else {
			this.setState( { authorSelectorToggled: false } );
		}

		this.setState( updateObj );
		this.props.recordGoogleEvent( 'People', 'Selected Delete User Assignment', 'Assign', value );
	};

	getAuthorSelector = () => {
		return (
			<AuthorSelector
				allowSingleUser
				siteId={ this.props.siteId }
				onSelect={ this.onSelectAuthor }
				exclude={ [ this.props.user.ID ] }
				ignoreContext={ this.reassignLabel }
			>
				{ this.state.reassignUser ? (
					<span>
						<Gravatar size={ 26 } user={ this.state.reassignUser } />
						<span className="delete-user__reassign-user-name">
							{ this.state.reassignUser.name }
						</span>
					</span>
				) : (
					this.getAuthorSelectPlaceholder()
				) }
			</AuthorSelector>
		);
	};

	getAuthorSelectPlaceholder = () => {
		return (
			<span className="delete-user__select-placeholder">
				<User size={ 26 } user={ { name: this.props.translate( 'Choose an author…' ) } } />
			</span>
		);
	};

	setReassignLabel = ( label ) => ( this.reassignLabel = label );

	onSelectAuthor = ( author ) => this.setState( { reassignUser: author } );

	removeUser = () => {
		const { contributorType, siteId, translate, user } = this.props;
		accept(
			<div>
				<p>
					{ user && user.name
						? translate(
								'If you remove %(username)s, that user will no longer be able to access this site, ' +
									'but any content that was created by %(username)s will remain on the site.',
								{
									args: {
										username: user.name,
									},
								}
						  )
						: translate(
								'If you remove this user, he or she will no longer be able to access this site, ' +
									'but any content that was created by this user will remain on the site.'
						  ) }
				</p>
				<p>{ translate( 'Would you still like to remove this user?' ) }</p>
			</div>,
			( accepted ) => {
				if ( accepted ) {
					this.props.recordGoogleEvent(
						'People',
						'Clicked Confirm Remove User on Edit User Network Site'
					);
					if ( 'external' === contributorType ) {
						requestExternalContributorsRemoval(
							siteId,
							user.linked_user_ID ? user.linked_user_ID : user.ID
						);
					}
					this.props.deleteUser( { userId: user.ID } );
				} else {
					this.props.recordGoogleEvent(
						'People',
						'Clicked Cancel Remove User on Edit User Network Site'
					);
				}
			},
			translate( 'Remove' )
		);
		this.props.recordGoogleEvent( 'People', 'Clicked Remove User on Edit User Network Site' );
	};

	deleteUser = ( event ) => {
		event.preventDefault();
		const { contributorType, siteId, user } = this.props;
		if ( ! user.ID ) {
			return;
		}

		let reassignUserId;
		if ( this.state.reassignUser && 'reassign' === this.state.radioOption ) {
			reassignUserId = this.state.reassignUser.ID;
		}
		if ( 'external' === contributorType ) {
			requestExternalContributorsRemoval(
				siteId,
				user.linked_user_ID ? user.linked_user_ID : user.ID
			);
		}
		this.props.deleteUser( { userId: user.ID, reassignUserId } );

		this.props.recordGoogleEvent( 'People', 'Clicked Remove User on Edit User Single Site' );
	};

	getTranslatedAssignLabel = () => {
		const { translate } = this.props;
		return translate( 'Attribute all content to another user' );
	};

	isDeleteButtonDisabled = () => {
		const {
			contributorType,
			user: { ID: userId },
		} = this.props;

		const { radioOption, reassignUser } = this.state;

		if ( 'pending' === contributorType ) {
			return true;
		}

		if ( 'reassign' === radioOption ) {
			return false === reassignUser || reassignUser.ID === userId;
		}

		return false === radioOption;
	};

	renderSingleSite = () => {
		const { translate } = this.props;
		return (
			<Card className="delete-user__single-site">
				<form onSubmit={ this.deleteUser }>
					<FormSectionHeading>{ this.getDeleteText() }</FormSectionHeading>

					<p className="delete-user__explanation">
						{ this.props.user.name
							? translate(
									'You have the option of reassigning all content created by ' +
										'%(username)s, or deleting the content entirely.',
									{
										args: {
											username: this.props.user.name,
										},
									}
							  )
							: translate(
									'You have the option of reassigning all content created by ' +
										'this user, or deleting the content entirely.'
							  ) }
					</p>

					<FormFieldset>
						<FormLabel ref={ this.setReassignLabel }>
							<FormRadio
								name="radioOption"
								onChange={ this.handleRadioChange }
								value="reassign"
								checked={ 'reassign' === this.state.radioOption }
								label={ this.getTranslatedAssignLabel() }
							/>
						</FormLabel>

						{ this.state.authorSelectorToggled ? (
							<div className="delete-user__author-selector">{ this.getAuthorSelector() }</div>
						) : null }

						<FormLabel>
							<FormRadio
								name="radioOption"
								onChange={ this.handleRadioChange }
								value="delete"
								checked={ 'delete' === this.state.radioOption }
								label={
									this.props.user.name
										? translate( 'Delete all content created by %(username)s', {
												args: {
													username: this.props.user.name ? this.props.user.name : '',
												},
										  } )
										: translate( 'Delete all content created by this user' )
								}
							/>
						</FormLabel>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton scary={ true } disabled={ this.isDeleteButtonDisabled() }>
							{ translate( 'Delete user', { context: 'Button label' } ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</Card>
		);
	};

	renderMultisite = () => {
		return (
			<CompactCard className="delete-user__multisite">
				<Button borderless className="delete-user__remove-user" onClick={ this.removeUser }>
					<Gridicon icon="trash" />
					<span>{ this.getRemoveText() }</span>
				</Button>
			</CompactCard>
		);
	};

	render() {
		// A user should not be able to remove themself.
		const { user, currentUser } = this.props;
		const isCurrentUser = ( user.linked_user_ID ?? user.ID ) === currentUser.ID;

		if ( isCurrentUser ) {
			return null;
		}

		return this.props.isMultisite ? this.renderMultisite() : this.renderSingleSite();
	}
}

const withDeleteUser = ( Component ) => {
	return ( props ) => {
		const { siteId, user, translate, isMultisite, siteSlug } = props;
		const { deleteUser, isSuccess, isError, error } = useDeleteUser( siteId );
		const dispatch = useDispatch();

		React.useEffect( () => {
			if ( isSuccess ) {
				dispatch(
					successNotice(
						isMultisite
							? translate( 'Successfully removed @%(user)s', {
									args: { user: user?.login },
									context: 'Success message after a user has been modified.',
							  } )
							: translate( 'Successfully deleted @%(user)s', {
									args: { user: user?.login },
									context: 'Success message after a user has been modified.',
							  } ),
						{ id: 'delete-user-notice', displayOnNextPage: true }
					)
				);
				page.redirect( `/people/team${ siteSlug ? `/${ siteSlug }` : '' }` );
			}
		}, [ isSuccess, translate, dispatch, user, isMultisite, siteSlug ] );

		React.useEffect( () => {
			if ( isError ) {
				if ( 'user_owns_domain_subscription' === error.error ) {
					const numDomains = error.message.split( ',' ).length;
					dispatch(
						errorNotice(
							translate(
								'@%(user)s owns following domain used on this site: {{strong}}%(domains)s{{/strong}}. This domain will have to be transferred to a different site, transferred to a different registrar, or canceled before removing or deleting @%(user)s.',
								'@%(user)s owns following domains used on this site: {{strong}}%(domains)s{{/strong}}. These domains will have to be transferred to a different site, transferred to a different registrar, or canceled before removing or deleting @%(user)s.',
								{
									count: numDomains,
									args: {
										domains: error.message,
										user: user.login,
									},
									components: {
										strong: <strong />,
									},
								}
							),
							{ id: 'delete-user-notice' }
						)
					);
				}

				dispatch(
					errorNotice(
						isMultisite
							? translate( 'There was an error removing @%(user)s', {
									args: { user: user.login },
									context: 'Error message after A site has failed to perform actions on a user.',
							  } )
							: translate( 'There was an error deleting @%(user)s', {
									args: { user: user.login },
									context: 'Error message after A site has failed to perform actions on a user.',
							  } )
					)
				);
			}
		}, [ isError, error, translate, dispatch, user, isMultisite ] );

		return <Component { ...props } deleteUser={ deleteUser } />;
	};
};

const getContributorType = ( externalContributors, userId ) => {
	if ( externalContributors.data ) {
		return externalContributors.data.includes( userId ) ? 'external' : 'standard';
	}
	return 'pending';
};

export default localize(
	connect(
		( state, { siteId, user } ) => {
			const userId = user && user.ID;
			const linkedUserId = user && user.linked_user_ID;
			const externalContributors = siteId ? requestExternalContributors( siteId ) : httpData.empty;
			return {
				currentUser: getCurrentUser( state ),
				contributorType: getContributorType(
					externalContributors,
					undefined !== linkedUserId ? linkedUserId : userId
				),
			};
		},
		{ recordGoogleEvent }
	)( withDeleteUser( DeleteUser ) )
);
