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
import PostTypeFilter from 'client/my-sites/post-type-filter';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import PostTypeList from 'client/my-sites/post-type-list';
import PostTypeBulkEditBar from 'client/my-sites/post-type-list/bulk-edit-bar';
import config from 'config';
import Main from 'client/components/main';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { mapPostStatus as mapStatus } from 'client/lib/route';
import { warningNotice } from 'client/state/notices/actions';
import {
	getSiteAdminUrl,
	isJetpackSite,
	siteHasMinimumJetpackVersion,
} from 'client/state/sites/selectors';

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
			number: 20, // max supported by /me/posts endpoint for all-sites mode
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
					<PostTypeList query={ query } scrollContainer={ document.body } />
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
