/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ReaderSidebarBlogsList from './list';
import getSitesItems from 'state/selectors/get-sites-items';

export class ReaderSidebarBlogs extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		unseen: PropTypes.obj,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	render() {
		const { isOpen, translate, onClick, unseen } = this.props;
		return (
			<ul className={ unseen && unseen.status ? 'has-unseen' : '' }>
				{ unseen && unseen.status && <span className="sidebar__reader-bubble" /> }
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'P2020' ) }
					onClick={ onClick }
					materialIcon="accessibility"
				>
					<ReaderSidebarBlogsList { ...this.props } />
				</ExpandableSidebarMenu>
			</ul>
		);
	}
}

export default connect( ( state ) => ( {
	// WAIT WHAT, switch to selector.
	blogs: Object.values( getSitesItems( state ) ).filter(
		( item ) => item.options.is_wpforteams_site
	),
} ) )( localize( ReaderSidebarBlogs ) );
