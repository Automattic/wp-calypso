/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';

export const POSTS = 'Posts';
export const SITES = 'Sites';

class SearchStreamHeader extends Component {
	static propTypes = {
		translate: PropTypes.func,
		wideDisplay: PropTypes.bool,
		selected: PropTypes.oneOf( [ POSTS, SITES ] ),
		onSelection: PropTypes.func,
	};
	static defaultProps = {
		onSelection: noop,
	}

	handlePostsSelected = () => this.props.onSelection( POSTS );
	handleSitesSelected = () => this.props.onSelection( SITES );

	render() {
		const { translate, wideDisplay, selected } = this.props;

		if ( wideDisplay ) {
			return (
				<ul className="search-stream__headers">
					<li className="search-stream__post-header">{ translate( 'Posts' ) }</li>
					<li className="search-stream__site-header">{ translate( 'Sites' ) }</li>
				</ul>
			);
		}

		return (
			<div>
				<SectionNav>
					<NavTabs>
						<NavItem
							key={ 'posts-nav' }
							selected={ selected === POSTS }
							onClick={ this.handlePostsSelected }
						>
							{ translate( 'Posts' ) }
						</NavItem>
						<NavItem
							key={ 'sites-nav' }
							selected={ selected === SITES }
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
