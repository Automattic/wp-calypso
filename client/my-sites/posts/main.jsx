/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostTypeFilter from 'my-sites/post-type-filter';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PostListWrapper from './post-list-wrapper';
import PostTypeBulkEditBar from 'my-sites/post-type-list/bulk-edit-bar';
import config from 'config';
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { mapPostStatus as mapStatus } from 'lib/route';
import { warningNotice } from 'state/notices/actions';
import {
	getSiteAdminUrl,
	isJetpackSite,
	siteHasMinimumJetpackVersion,
} from 'state/sites/selectors';

class PostsMain extends React.Component {
	componentWillMount() {
		this.setWarning( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.siteId !== this.props.siteId ||
			nextProps.hasMinimumJetpackVersion !== this.props.hasMinimumJetpackVersion
		) {
			this.setWarning( nextProps );
		}
	}

	render() {
		const { author, category, search, siteId, statusSlug, tag } = this.props;
		const classes = classnames( 'posts', {
			'is-multisite': ! this.props.siteId,
			'is-single-site': this.props.siteId,
		} );
		const query = {
			author,
			category,
			search,
			site_visibility: ! siteId ? 'visible' : undefined,
			status: mapStatus( statusSlug ),
			tag,
			type: 'post',
		};

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<div className="posts__primary">
					<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ statusSlug } />
					{ siteId && <PostTypeBulkEditBar /> }
					<PostListWrapper { ...this.props } />
				</div>
			</Main>
		);
	}

	setWarning = ( { adminUrl, hasMinimumJetpackVersion, isJetpack, siteId } ) => {
		if ( siteId && isJetpack && false === hasMinimumJetpackVersion ) {
			this.props.warningNotice(
				this.props.translate(
					'Jetpack %(version)s is required to take full advantage of all post editing features.',
					{
						args: { version: config( 'jetpack_min_version' ) },
					}
				),
				{
					button: this.props.translate( 'Update now' ),
					href: adminUrl,
				}
			);
		}
	};
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );

	return {
		adminUrl: getSiteAdminUrl( state, siteId, 'plugins.php?plugin_status=upgrade' ),
		hasMinimumJetpackVersion: siteHasMinimumJetpackVersion( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
	};
}

export default connect( mapStateToProps, {
	warningNotice,
} )( localize( PostsMain ) );
