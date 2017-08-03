/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PeopleProfile from 'my-sites/people/people-profile';
import analytics from 'lib/analytics';
import config from 'config';

export default React.createClass( {

	displayName: 'PeopleListItem',

	mixins: [ PureRenderMixin ],

	navigateToUser() {
		window.scrollTo( 0, 0 );
		analytics.ga.recordEvent( 'People', 'Clicked User Profile From Team List' );
	},

	userHasPromoteCapability() {
		const site = this.props.site;
		return site && site.capabilities && site.capabilities.promote_users;
	},

	canLinkToProfile() {
		const site = this.props.site,
			user = this.props.user;
		return (
			config.isEnabled( 'manage/edit-user' ) &&
			user &&
			user.roles &&
			site &&
			site.slug &&
			this.userHasPromoteCapability() &&
			! this.props.isSelectable
		);
	},

	render() {
		const canLinkToProfile = this.canLinkToProfile();
		return (
			<CompactCard
				{ ...omit( this.props, 'className', 'user', 'site', 'isSelectable', 'onRemove' ) }
				className={ classNames( 'people-list-item', this.props.className ) }
				tagName="a"
				href={ canLinkToProfile && '/people/edit/' + this.props.site.slug + '/' + this.props.user.login }
				onClick={ canLinkToProfile && this.navigateToUser }>
				<div className="people-list-item__profile-container">
					<PeopleProfile user={ this.props.user } />
				</div>
				{
				this.props.onRemove &&
				<div className="people-list-item__actions">
					<button className="button is-link people-list-item__remove-button" onClick={ this.props.onRemove }>
						{ this.translate( 'Remove', { context: 'Verb: Remove a user or follower from the blog.' } ) }
					</button>
				</div>
				}
			</CompactCard>
		);
	}
} );
