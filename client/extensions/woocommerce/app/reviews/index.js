/**
 * External depedencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

class Reviews extends Component {

	render() {
		const { className, translate } = this.props;
		const classes = classNames( 'reviews__list', className );

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Reviews' ) }</span> ) } />
			</Main>
		);
	}
}

export default localize( Reviews );
