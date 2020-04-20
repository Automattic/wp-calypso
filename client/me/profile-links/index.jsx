/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import ProfileLink from 'me/profile-link';
import QueryProfileLinks from 'components/data/query-profile-links';
import AddProfileLinksButtons from 'me/profile-links/add-buttons';
import SectionHeader from 'components/section-header';
import { Card } from '@automattic/components';
import Notice from 'components/notice';
import ProfileLinksAddWordPress from 'me/profile-links-add-wordpress';
import ProfileLinksAddOther from 'me/profile-links-add-other';
import { deleteUserProfileLink, resetUserProfileLinkErrors } from 'state/profile-links/actions';
import getProfileLinks from 'state/selectors/get-profile-links';
import getProfileLinksErrorType from 'state/selectors/get-profile-links-error-type';

/**
 * Style dependencies
 */
import './style.scss';

class ProfileLinks extends React.Component {
	state = {
		showingForm: null,
		showPopoverMenu: false,
	};

	showAddWordPress = () => {
		this.setState( {
			showingForm: 'wordpress',
			showPopoverMenu: false,
		} );
	};

	showAddOther = () => {
		this.setState( {
			showingForm: 'other',
			showPopoverMenu: false,
		} );
	};

	showPopoverMenu = () => {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu,
		} );
	};

	closePopoverMenu = () => {
		this.setState( {
			showPopoverMenu: false,
		} );
	};

	hideForms = () => {
		this.setState( {
			showingForm: null,
		} );
	};

	onRemoveLink = ( profileLink ) => {
		return () => this.props.deleteUserProfileLink( profileLink.link_slug );
	};

	getErrorMessage() {
		const { errorType, translate } = this.props;

		if ( ! errorType ) {
			return null;
		}

		if ( errorType === 'duplicate' ) {
			return translate( 'That link is already in your profile links. No changes were made.' );
		}
		return translate( 'An unexpected error occurred. Please try again later.' );
	}

	possiblyRenderError() {
		const errorMessage = this.getErrorMessage();
		if ( ! errorMessage ) {
			return null;
		}

		return (
			<Notice
				className="profile-links__error"
				status="is-error"
				onDismissClick={ this.props.resetUserProfileLinkErrors }
			>
				{ errorMessage }
			</Notice>
		);
	}

	renderProfileLinksList() {
		return (
			<ul className="profile-links__list">
				{ this.props.profileLinks.map( ( profileLink ) => (
					<ProfileLink
						key={ profileLink.link_slug }
						title={ profileLink.title }
						url={ profileLink.value }
						slug={ profileLink.link_slug }
						onRemoveLink={ this.onRemoveLink( profileLink ) }
					/>
				) ) }
			</ul>
		);
	}

	renderNoProfileLinks() {
		return (
			<p className="profile-links__no-links">
				{ this.props.translate(
					"You have no sites in your profile links. You may add sites if you'd like."
				) }
			</p>
		);
	}

	renderPlaceholders() {
		return (
			<ul className="profile-links__list">
				{ times( 2, ( index ) => (
					<ProfileLink
						title="Loading Profile Links"
						url="http://wordpress.com"
						slug="A placeholder profile link"
						isPlaceholder
						key={ index }
					/>
				) ) }
			</ul>
		);
	}

	renderProfileLinks() {
		const initialized = this.props.profileLinks !== null;
		const countLinks = initialized ? this.props.profileLinks.length : 0;
		let links;

		if ( ! initialized ) {
			links = this.renderPlaceholders();
		} else {
			links = countLinks > 0 ? this.renderProfileLinksList() : this.renderNoProfileLinks();
		}

		return (
			<div>
				<p>{ this.props.translate( 'Manage which sites appear in your profile.' ) }</p>

				{ this.possiblyRenderError() }
				{ links }
			</div>
		);
	}

	renderForm() {
		if ( 'wordpress' === this.state.showingForm ) {
			return <ProfileLinksAddWordPress onSuccess={ this.hideForms } onCancel={ this.hideForms } />;
		}

		return <ProfileLinksAddOther onSuccess={ this.hideForms } onCancel={ this.hideForms } />;
	}

	render() {
		return (
			<Fragment>
				<QueryProfileLinks />
				<SectionHeader label={ this.props.translate( 'Profile Links' ) }>
					<AddProfileLinksButtons
						showingForm={ this.state.showingForm }
						onShowAddOther={ this.showAddOther }
						showPopoverMenu={ this.state.showPopoverMenu }
						onShowAddWordPress={ this.showAddWordPress }
						onShowPopoverMenu={ this.showPopoverMenu }
						onClosePopoverMenu={ this.closePopoverMenu }
					/>
				</SectionHeader>
				<Card>{ this.state.showingForm ? this.renderForm() : this.renderProfileLinks() }</Card>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		profileLinks: getProfileLinks( state ),
		errorType: getProfileLinksErrorType( state ),
	} ),
	{
		deleteUserProfileLink,
		resetUserProfileLinkErrors,
	}
)( localize( ProfileLinks ) );
