/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SidebarHeading from 'client/layout/sidebar/heading';
import SidebarMenu from 'client/layout/sidebar/menu';
import SidebarItem from 'client/layout/sidebar/item';

class DesignToolList extends React.Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
	};

	renderControl = tool => {
		const onChange = event => {
			event.preventDefault();
			this.props.onChange( tool.value );
		};
		return (
			<SidebarItem
				className="design-tool-list__button"
				icon={ tool.icon }
				label={ tool.label }
				link="/customize"
				onNavigate={ onChange }
			>
				<Gridicon
					icon="chevron-right"
					size={ 24 }
					onClick={ onChange }
					className="design-tool-list__button__icon"
				/>
			</SidebarItem>
		);
	};

	render() {
		return (
			<div className="design-tool-list">
				<SidebarHeading>{ this.props.translate( 'Site Identity' ) }</SidebarHeading>
				<SidebarMenu>
					<ul>
						{ this.renderControl( {
							icon: 'heading',
							label: this.props.translate( 'Title and Tagline' ),
							value: 'siteTitle',
						} ) }
					</ul>
				</SidebarMenu>
			</div>
		);
	}
}

export default localize( DesignToolList );
