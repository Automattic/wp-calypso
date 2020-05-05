/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, startsWith } from 'lodash';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import { Button } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

/**
 * Style dependencies
 */
import './style.scss';

class PeopleListSectionHeader extends Component {
	static propTypes = {
		label: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		count: PropTypes.number,
		isFollower: PropTypes.bool,
		site: PropTypes.object,
		isSiteAutomatedTransfer: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
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

		return '/people/new/' + siteSlug;
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

	render() {
		const { label, count, children, translate } = this.props;
		const siteLink = this.getAddLink();
		const classes = classNames( this.props.className, 'people-list-section-header' );

		return (
			<SectionHeader
				className={ classes }
				count={ count }
				label={ label }
				isPlaceholder={ this.props.isPlaceholder }
				popoverText={ this.getPopoverText() }
			>
				{ children }
				{ siteLink && (
					<Button compact href={ siteLink } className="people-list-section-header__add-button">
						<Gridicon icon="user-add" />
						<span>
							{ translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }
						</span>
					</Button>
				) }
			</SectionHeader>
		);
	}
}

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		currentRoute: getCurrentRoute( state ),
	};
};

export default connect( mapStateToProps )( localize( PeopleListSectionHeader ) );
