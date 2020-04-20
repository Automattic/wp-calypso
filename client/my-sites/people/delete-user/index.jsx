/* eslint-disable jsx-a11y/anchor-is-valid */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card, Button, CompactCard } from '@automattic/components';
import Gridicon from 'components/gridicon';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import User from 'components/user';
import AuthorSelector from 'blocks/author-selector';
import { deleteUser } from 'lib/users/actions';
import accept from 'lib/accept';
import Gravatar from 'components/gravatar';
import { localize } from 'i18n-calypso';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import {
	requestExternalContributors,
	requestExternalContributorsRemoval,
} from 'state/data-getters';
import { httpData } from 'state/data-layer/http-data';

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
		const name = event.currentTarget.name,
			value = event.currentTarget.value,
			updateObj = {};

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
				<User size={ 26 } user={ { name: /* Don't translate yet */ 'Choose an author…' } } />
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
					deleteUser( siteId, user.ID );
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
		deleteUser( siteId, user.ID, reassignUserId );

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
							/>

							<span>{ this.getTranslatedAssignLabel() }</span>
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
							/>

							<span>
								{ this.props.user.name
									? translate( 'Delete all content created by %(username)s', {
											args: {
												username: this.props.user.name ? this.props.user.name : '',
											},
									  } )
									: translate( 'Delete all content created by this user' ) }
							</span>
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
		if ( ! this.props.isJetpack && this.props.user.ID === this.props.currentUser.ID ) {
			return null;
		}
		if ( this.props.isJetpack && this.props.user.linked_user_ID === this.props.currentUser.ID ) {
			return null;
		}

		return this.props.isMultisite ? this.renderMultisite() : this.renderSingleSite();
	}
}

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
	)( DeleteUser )
);
