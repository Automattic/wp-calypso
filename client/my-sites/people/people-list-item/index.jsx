/**
 * External dependencies
 */
const React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	classNames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

/**
 * Internal dependencies
 */
const CompactCard = require( 'components/card/compact' ),
	PeopleProfile = require( 'my-sites/people/people-profile' ),
	analytics = require( 'analytics' ),
	config = require( 'config' );

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
				{ ...omit( this.props, 'className' ) }
				className={ classNames( 'people-list-item', this.props.className ) }
				tagName="a"
				href={ canLinkToProfile && '/people/edit/' + this.props.user.login + '/' + this.props.site.slug }
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
