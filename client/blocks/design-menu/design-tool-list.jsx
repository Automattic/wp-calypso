/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarItem from 'layout/sidebar/item';

const DesignToolList = React.createClass( {
	propTypes: {
		onChange: React.PropTypes.func.isRequired,
		designTools: React.PropTypes.array.isRequired,
	},

	renderControl( tool ) {
		const onChange = event => {
			event.preventDefault();
			this.props.onChange( tool.id );
		};
		return (
			<SidebarItem
				key={ tool.id }
				className="design-menu__design-tool-list__button"
				icon={ tool.icon }
				label={ tool.label }
				link="/customize"
				onNavigate={ onChange }
			>
				<Gridicon
					icon="chevron-right"
					size={ 24 }
					onClick={ onChange }
					className="design-menu__design-tool-list__button__icon"
				/>
			</SidebarItem>
			);
	},

	renderSection( section ) {
		return (
			<div className="design-menu__design-tool-list__section" key={ section.title } >
				<SidebarHeading>{ section.title }</SidebarHeading>
				<SidebarMenu>
					<ul>
						{ section.items.map( this.renderControl ) }
					</ul>
				</SidebarMenu>
			</div>
		);
	},

	render() {
		return (
			<div className="design-menu__design-tool-list">
				{ this.props.designTools.map( this.renderSection ) }
			</div>
		);
	}
} );

export default DesignToolList;
