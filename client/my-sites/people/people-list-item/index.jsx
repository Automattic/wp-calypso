/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import omit from 'lodash/omit';
import identity from 'lodash/identity';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PeopleProfile from 'my-sites/people/people-profile';
import config from 'config';
import { recordGoogleEvent } from 'state/analytics/actions';

const browserWindow = 'undefined' === typeof window
    ? window
    : { scrollTo: identity };

export class PeopleListItem extends PureComponent {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	navigateToUser = () => {
		browserWindow.scrollTo( 0, 0 );
		this.props.recordGoogleEvent( 'People', 'Clicked User Profile From Team List' );
	};

	userHasPromoteCapability = () => {
		const site = this.props.site;
		return site && site.capabilities && site.capabilities.promote_users;
	};

	canLinkToProfile = () => {
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
	};

	render() {
		const canLinkToProfile = this.canLinkToProfile();
		return (
			<CompactCard
				{ ...omit( this.props, 'className', 'user', 'site', 'isSelectable', 'onRemove', 'translate', 'moment', 'numberFormat', 'recordGoogleEvent' ) }
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
						{ this.props.translate( 'Remove' ) }
					</button>
				</div>
				}
			</CompactCard>
		);
	}
}

export default connect(
	null,
	{
		recordGoogleEvent,
	},
)( localize( PeopleListItem ) );
