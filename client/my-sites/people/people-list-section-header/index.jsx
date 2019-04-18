/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

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

const mapStateToProps = state => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
	};
};

export default connect( mapStateToProps )( localize( PeopleListSectionHeader ) );
