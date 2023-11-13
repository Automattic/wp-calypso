import { useTranslate } from 'i18n-calypso';
import { find, map, pickBy } from 'lodash';
import { Component } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import { onboardingUrl } from 'calypso/lib/paths';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import getPublicSites from 'calypso/state/selectors/get-public-sites';
import getSites from 'calypso/state/selectors/get-sites';
import { useProfileLinksQuery } from '../../data/use-profile-links-query';
import ProfileLinksAddWordPressSite from './site';

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

	onAddableSubmit = async ( event ) => {
		event.preventDefault();
		const { sites, isAddingProfileLinks } = this.props;

		if ( isAddingProfileLinks ) {
			return;
		}

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
		}
	};

	onCancel = ( event ) => {
		event.preventDefault();
		this.props.onCancel();
	};

	onCreateSite = ( event ) => {
		event.preventDefault();
		window.open( onboardingUrl() + '?ref=me-profile-links' );
		this.props.onCancel();
	};

	onJetpackMe = () => {
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

		const isSubmitDisabled = 0 === checkedCount || this.props.isAddingProfileLinks;

		return (
			<form className="profile-links-add-wordpress" onSubmit={ this.onAddableSubmit }>
				<p>{ translate( 'Please select one or more sites to add to your profile.' ) }</p>
				<ul className="profile-links-add-wordpress__list">{ this.renderAddableSites() }</ul>
				<FormButton
					disabled={ isSubmitDisabled }
					onClick={ this.getClickHandler( 'Add WordPress Sites Button' ) }
					busy={ this.props.isAddingProfileLinks }
				>
					{ translate( 'Add Site', 'Add Sites', { context: 'bulk action', count: checkedCount } ) }
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
										href="https://jetpack.me"
										target="_blank"
										rel="noreferrer"
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

export default function EnhancedProfileLinksAddWordPress( props ) {
	const translate = useTranslate();

	const { data: profileLinks } = useProfileLinksQuery();

	const dispatch = useDispatch();
	const sites = useSelector( getSites );
	const publicSites = useSelector( getPublicSites );

	const publicSitesNotInProfileLinks = publicSites.filter( ( site ) => {
		return ! profileLinks.some(
			// the regex below is used to strip any leading scheme from the profileLink's URL
			( profileLink ) => profileLink.value.replace( /^.*:\/\//, '' ) === site.domain
		);
	} );

	return (
		<ProfileLinksAddWordPress
			sites={ sites }
			publicSites={ publicSites }
			publicSitesNotInProfileLinks={ publicSitesNotInProfileLinks }
			recordGoogleEvent={ ( ...args ) => dispatch( recordGoogleEvent( ...args ) ) }
			translate={ translate }
			{ ...props }
		/>
	);
}
