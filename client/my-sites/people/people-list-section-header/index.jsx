import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class PeopleListSectionHeader extends Component {
	static propTypes = {
		label: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		count: PropTypes.number,
		isFollower: PropTypes.bool,
		site: PropTypes.object,
		isSiteAutomatedTransfer: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		includeSubscriberImporter: PropTypes.bool,
	};

	static defaultProps = {
		isFollower: false,
		isPlaceholder: false,
	};

	getAddLink() {
		const siteSlug = get( this.props, 'site.slug' );
		const isJetpack = get( this.props, 'site.jetpack' );

		if ( ! siteSlug || ( isJetpack && this.props.isFollower ) ) {
			return false;
		}

		if ( this.isFollowersTab() ) {
			return '/people/email-followers/' + siteSlug;
		}

		return '/people/new/' + siteSlug;
	}

	getAddSubscriberLink() {
		const siteSlug = get( this.props, 'site.slug' );

		return '/people/add-subscribers/' + siteSlug;
	}

	getPopoverText() {
		const { currentRoute, translate } = this.props;

		if ( startsWith( currentRoute, '/people/followers' ) ) {
			return translate( 'A list of people currently following your site' );
		}

		if ( startsWith( currentRoute, '/people/email-followers' ) ) {
			return translate( 'A list of people who are subscribed to your blog via email only' );
		}

		return null;
	}

	isSubscribersTab() {
		const { currentRoute } = this.props;

		return startsWith( currentRoute, '/people/email-followers' );
	}

	isFollowersTab() {
		const { currentRoute } = this.props;

		return startsWith( currentRoute, '/people/followers' );
	}

	render() {
		const { label, count, children, translate, includeSubscriberImporter } = this.props;
		const siteLink = this.getAddLink();
		const addSubscriberLink = this.getAddSubscriberLink();
		const classes = classNames( this.props.className, 'people-list-section-header' );

		const showInviteUserBtn =
			( siteLink && ! this.isSubscribersTab() ) || ( siteLink && ! includeSubscriberImporter );
		const showAddSubscriberBtn =
			addSubscriberLink && this.isSubscribersTab() && includeSubscriberImporter;

		return (
			<SectionHeader
				className={ classes }
				count={ count }
				label={ label }
				isPlaceholder={ this.props.isPlaceholder }
				popoverText={ this.getPopoverText() }
			>
				{ children }
				{ showInviteUserBtn && (
					<Button compact href={ siteLink } className="people-list-section-header__add-button">
						<Gridicon icon="user-add" />
						<span>
							{ includeSubscriberImporter
								? translate( 'Add User', { context: 'Verb. Button to invite more users.' } )
								: translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }
						</span>
					</Button>
				) }
				{ showAddSubscriberBtn && (
					<Button href={ addSubscriberLink } compact primary>
						{ translate( 'Add Subscribers', { context: 'Verb. Button to add more subscribers.' } ) }
					</Button>
				) }
			</SectionHeader>
		);
	}
}

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		includeSubscriberImporter: isEligibleForSubscriberImporter( state ),
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		currentRoute: getCurrentRoute( state ),
	};
};

export default connect( mapStateToProps )( localize( PeopleListSectionHeader ) );
