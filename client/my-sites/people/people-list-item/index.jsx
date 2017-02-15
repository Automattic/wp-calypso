/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PeopleProfile from 'my-sites/people/people-profile';
import config from 'config';
import { recordGoogleEvent } from 'state/analytics/actions';

export class PeopleListItem extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	userHasPromoteCapability = () => get( this.props.site, 'capabilities.promote_users', false );

	canLinkToProfile = () => {
		const {
			isSelectable,
			site,
			user,
		} = this.props;
		return (
			config.isEnabled( 'manage/edit-user' ) &&
			user &&
			user.roles &&
			site &&
			site.slug &&
			this.userHasPromoteCapability() && ! isSelectable
		);
	};

	render() {
		const canLinkToProfile = this.canLinkToProfile();

		return (
			<CompactCard
				type={ this.props.type }
				className={ classNames( 'people-list-item', this.props.className ) }
				tagName="a"
				href={ canLinkToProfile && '/people/edit/' + this.props.site.slug + '/' + this.props.user.login }
				onClick={ canLinkToProfile && this.props.navigateToUser }>
				<div className="people-list-item__profile-container">
					<PeopleProfile user={ this.props.user } />
				</div>
				{
				this.props.onRemove &&
				<div className="people-list-item__actions">
					<button className="button is-link people-list-item__remove-button" onClick={ this.props.onRemove }>
						{ this.props.translate( 'Remove' ) }
					</button>
				</div>
				}
			</CompactCard>
		);
	}
}

const navigateToUser = () => {
	return recordGoogleEvent( 'People', 'Clicked User profile from team list' );
};

const mapDispatchToProps = {
	navigateToUser,
};

export default connect( null, mapDispatchToProps )( localize( PeopleListItem ) );
