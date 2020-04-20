/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, map, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import FormButton from 'components/forms/form-button';
import ProfileLinksAddWordPressSite from './site';
import { addUserProfileLinks } from 'state/profile-links/actions';
import getPublicSites from 'state/selectors/get-public-sites';
import getSites from 'state/selectors/get-sites';
import isSiteInProfileLinks from 'state/selectors/is-site-in-profile-links';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ProfileLinksAddWordPress extends Component {
	// an empty initial state is required to keep render and handleCheckedChange
	// code simpler / easier to maintain
	state = {};

	handleCheckedChanged = ( event ) => {
		const updates = {};
		updates[ event.target.name ] = event.target.checked;
		this.setState( updates );
	};

	recordClickEvent = ( action ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	getClickHandler = ( action ) => {
		return () => this.recordClickEvent( action );
	};

	handleCancelButtonClick = ( event ) => {
		this.recordClickEvent( 'Cancel Add WordPress Sites Button' );
		this.onCancel( event );
	};

	handleJetpackLinkClick = ( event ) => {
		this.recordClickEvent( 'Jetpack Link in Profile Links' );
		this.onJetpackMe( event );
	};

	handleCreateSiteButtonClick = ( event ) => {
		this.recordClickEvent( 'Create Sites Button in Profile Links' );
		this.onCreateSite( event );
	};

	onSelect = ( event, inputName ) => {
		const updates = {};
		updates[ inputName ] = ! this.state[ inputName ];
		this.setState( updates );
	};

	getCheckedCount() {
		let checkedCount = 0;
		let inputName;
		for ( inputName in this.state ) {
			if ( this.state[ inputName ] ) {
				checkedCount++;
			}
		}
		return checkedCount;
	}

	onAddableSubmit = ( event ) => {
		event.preventDefault();
		const { sites } = this.props;

		const links = pickBy(
			this.state,
			( inputValue, inputName ) => 'site-' === inputName.substr( 0, 5 ) && inputValue
		);

		const profileLinks = map( links, ( inputValue, inputName ) =>
			parseInt( inputName.substr( 5 ), 10 )
		)
			.map( ( siteId ) => find( sites, [ 'ID', siteId ] ) )
			.map( ( site ) => ( {
				title: site.name,
				value: site.URL,
			} ) );

		if ( profileLinks.length ) {
			this.props.addUserProfileLinks( profileLinks );
			this.props.onSuccess();
		}
	};

	onCancel = ( event ) => {
		event.preventDefault();
		this.props.onCancel();
	};

	onCreateSite = ( event ) => {
		event.preventDefault();
		window.open( config( 'signup_url' ) + '?ref=me-profile-links' );
		this.props.onCancel();
	};

	onJetpackMe = ( event ) => {
		event.preventDefault();
		window.open( 'http://jetpack.me/' );
		this.props.onCancel();
	};

	renderAddableSites() {
		return this.props.publicSitesNotInProfileLinks.map( ( site ) => {
			const inputName = 'site-' + site.ID;
			const checkedState = this.state[ inputName ];

			return (
				<ProfileLinksAddWordPressSite
					key={ inputName }
					site={ site }
					checked={ checkedState }
					onChange={ this.handleCheckedChanged }
					onSelect={ this.onSelect }
				/>
			);
		} );
	}

	renderAddableSitesForm() {
		const { translate } = this.props;
		const checkedCount = this.getCheckedCount();

		return (
			<form className="profile-links-add-wordpress" onSubmit={ this.onAddableSubmit }>
				<p>{ translate( 'Please select one or more sites to add to your profile.' ) }</p>
				<ul className="profile-links-add-wordpress__list">{ this.renderAddableSites() }</ul>
				<FormButton
					disabled={ 0 === checkedCount ? true : false }
					onClick={ this.getClickHandler( 'Add WordPress Sites Button' ) }
				>
					{ translate( 'Add Site', 'Add Sites', { count: checkedCount } ) }
				</FormButton>
				<FormButton
					className="profile-links-add-wordpress__cancel"
					isPrimary={ false }
					onClick={ this.handleCancelButtonClick }
				>
					{ translate( 'Cancel' ) }
				</FormButton>
			</form>
		);
	}

	renderInvitationForm() {
		const { translate } = this.props;

		return (
			<form>
				<p>
					{ translate(
						'You have no public sites on WordPress.com yet, but if you like you ' +
							'can create one now. You may also add self-hosted WordPress ' +
							'sites here after installing {{jetpackLink}}Jetpack{{/jetpackLink}} on them.',
						{
							components: {
								jetpackLink: (
									<a
										href="#"
										className="profile-links-add-wordpress__jetpack-link"
										onClick={ this.handleJetpackLinkClick }
									/>
								),
							},
						}
					) }
				</p>
				<FormButton onClick={ this.handleCreateSiteButtonClick }>
					{ translate( 'Create Site' ) }
				</FormButton>
				<FormButton
					className="profile-links-add-wordpress__cancel"
					isPrimary={ false }
					onClick={ this.handleCancelButtonClick }
				>
					{ translate( 'Cancel' ) }
				</FormButton>
			</form>
		);
	}

	render() {
		return (
			<div>
				{ 0 === this.props.publicSites.length
					? this.renderInvitationForm()
					: this.renderAddableSitesForm() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const publicSites = getPublicSites( state );
		const publicSitesNotInProfileLinks = publicSites.filter(
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			( site ) => ! isSiteInProfileLinks( state, site.domain )
		);

		return {
			publicSites,
			publicSitesNotInProfileLinks,
			sites: getSites( state ),
		};
	},
	{
		addUserProfileLinks,
		recordGoogleEvent,
	}
)( localize( ProfileLinksAddWordPress ) );
