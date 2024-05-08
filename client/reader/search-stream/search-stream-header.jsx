import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { values } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

const noop = () => {};
export const SEARCH_TYPES = { POSTS: 'posts', SITES: 'sites' };

class SearchStreamHeader extends Component {
	static propTypes = {
		translate: PropTypes.func,
		wideDisplay: PropTypes.bool,
		selected: PropTypes.oneOf( values( SEARCH_TYPES ) ),
		onSelection: PropTypes.func,
		isLoggedIn: PropTypes.bool,
	};
	static defaultProps = {
		onSelection: noop,
		selected: SEARCH_TYPES.posts,
	};

	handlePostsSelected = () => this.props.onSelection( SEARCH_TYPES.POSTS );
	handleSitesSelected = () => this.props.onSelection( SEARCH_TYPES.SITES );

	render() {
		const { translate, wideDisplay, selected, isLoggedIn } = this.props;

		if ( wideDisplay ) {
			return (
				<ul
					className={ clsx( 'search-stream__headers', {
						'search-stream__headers-logged-out': ! isLoggedIn,
					} ) }
				>
					<li className="search-stream__post-header">{ translate( 'Posts' ) }</li>
					<li className="search-stream__site-header">{ translate( 'Sites' ) }</li>
				</ul>
			);
		}

		return (
			<div className="search-stream__header">
				<SectionNav>
					<NavTabs>
						<NavItem
							key="posts-nav"
							selected={ selected === SEARCH_TYPES.POSTS }
							onClick={ this.handlePostsSelected }
						>
							{ translate( 'Posts' ) }
						</NavItem>
						<NavItem
							key="sites-nav"
							selected={ selected === SEARCH_TYPES.SITES }
							onClick={ this.handleSitesSelected }
						>
							{ translate( 'Sites' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			</div>
		);
	}
}

export default localize( SearchStreamHeader );
