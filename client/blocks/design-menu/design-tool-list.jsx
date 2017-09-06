/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarItem from 'layout/sidebar/item';

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
				className="design-menu__tool-list-button"
				icon={ tool.icon }
				label={ tool.label }
				link="/customize"
				onNavigate={ onChange }
			>
				<Gridicon
					icon="chevron-right"
					size={ 24 }
					onClick={ onChange }
					className="design-menu__tool-list-button-icon"
				/>
			</SidebarItem>
		);
	};

	render() {
		return (
			<div className="design-menu__tool-list">
				<SidebarHeading>
					{ this.props.translate( 'Site Identity' ) }
				</SidebarHeading>
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
