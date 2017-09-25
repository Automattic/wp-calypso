/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import ProfileLink from 'me/profile-link';
import observe from 'lib/mixins/data-observe';
import AddProfileLinksButtons from 'me/profile-links/add-buttons';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Notice from 'components/notice';
import eventRecorder from 'me/event-recorder';
import ProfileLinksAddWordPress from 'me/profile-links-add-wordpress';
import ProfileLinksAddOther from 'me/profile-links-add-other';

export default localize( React.createClass( {

	displayName: 'ProfileLinks',

	mixins: [ observe( 'userProfileLinks' ), eventRecorder ],

	componentDidMount() {
		this.props.userProfileLinks.getProfileLinks();
		if ( typeof document.hidden !== 'undefined' ) {
			document.addEventListener( 'visibilitychange', this.handleVisibilityChange );
		}
	},

	componentWillUnmount() {
		if ( typeof document.hidden !== 'undefined' ) {
			document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );
		}
	},

	handleVisibilityChange() {
		// if we're visible now, fetch the links again in case they
		// changed (added/removed) something while the component this tab
		// is on was hidden
		if ( ! document.hidden ) {
			this.props.userProfileLinks.fetchProfileLinks();
		}
	},

	getDefaultProps() {
		return {
			userProfileLinks: {
				initialized: false
			}
		};
	},

	getInitialState() {
		return {
			showingForm: false,
			lastError: false,
			showPopoverMenu: false
		};
	},

	showAddWordPress() {
		this.setState( {
			showingForm: 'wordpress',
			showPopoverMenu: false
		} );
	},

	showAddOther() {
		this.setState( {
			showingForm: 'other',
			showPopoverMenu: false
		} );
	},

	showPopoverMenu() {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu
		} );
	},

	closePopoverMenu() {
		this.setState( {
			showPopoverMenu: false
		} );
	},

	hideForms() {
		this.setState( {
			showingForm: false
		} );
	},

	onRemoveLinkResponse( error ) {
		if ( error ) {
			this.setState( {
				lastError: error
			} );
		} else {
			this.setState( {
				lastError: false
			} );
		}
	},

	clearLastError() {
		this.setState( {
			lastError: false
		} );
	},

	onRemoveLink( profileLink ) {
		this.props.userProfileLinks.deleteProfileLinkBySlug( profileLink.link_slug, this.onRemoveLinkResponse );
	},

	possiblyRenderError() {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
		    <Notice className="profile-links__error"
				status="is-error"
				onDismissClick={ this.clearLastError }>
				{ this.props.translate( 'An error occurred while attempting to remove the link. Please try again later.' ) }
			</Notice>
		);
	},

	renderProfileLinksList() {
		return (
			<ul className="profile-links__list">
				{
					this.props.userProfileLinks.getProfileLinks().map( ( profileLink ) =>
						(
							<ProfileLink
								key={ profileLink.link_slug }
								title={ profileLink.title }
								url={ profileLink.value }
								slug={ profileLink.link_slug }
								onRemoveLink={ this.onRemoveLink.bind( this, profileLink ) } />
						)
					)
				}
			</ul>
		);
	},

	renderNoProfileLinks() {
		return (
		    <p className="profile-links__no-links">
				{
					this.props.translate( 'You have no sites in your profile links. You may add sites if you\'d like.' )
				}
			</p>
		);
	},

	renderPlaceholders() {
		return (
			<ul className="profile-links__list">
				{ times( 2, ( index ) =>
					(
						<ProfileLink
							title="Loading Profile Links"
							url="http://wordpress.com"
							slug="A placeholder profile link"
							isPlaceholder
							key={ index }
						/>
					)
				) }
			</ul>
		);
	},

	renderProfileLinks() {
		const initialized = this.props.userProfileLinks.initialized,
			countLinks = this.props.userProfileLinks.getProfileLinks().length;
		let links;

		if ( ! initialized ) {
			links = this.renderPlaceholders();
		} else {
			links = countLinks > 0 ? this.renderProfileLinksList() : this.renderNoProfileLinks();
		}

		return (
		    <div>
				<p>
					{ this.props.translate( 'Manage which sites appear in your profile.' ) }
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

	render() {
		return (
		    <div>
				<SectionHeader label={ this.props.translate( 'Profile Links' ) }>
					<AddProfileLinksButtons
						userProfileLinks={ this.props.userProfileLinks }
						showingForm={ !! this.state.showingForm }
						onShowAddOther={ this.showAddOther }
						showPopoverMenu={ this.state.showPopoverMenu }
						onShowAddWordPress={ this.showAddWordPress }
						onShowPopoverMenu={ this.showPopoverMenu }
						onClosePopoverMenu={ this.closePopoverMenu }
					/>
				</SectionHeader>
				<Card>
					{ !! this.state.showingForm ? this.renderForm() : this.renderProfileLinks() }
				</Card>
			</div>
		);
	}
} ) );
