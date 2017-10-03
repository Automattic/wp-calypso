/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarItem from 'layout/sidebar/item';

const DesignToolList = React.createClass( {
	propTypes: {
		onChange: PropTypes.func.isRequired,
	},

	renderControl( tool ) {
		const onChange = event => {
			event.preventDefault();
			this.props.onChange( tool.value );
		};
		return ( <SidebarItem
							className="design-tool-list__button"
							icon={ tool.icon }
							label={ tool.label }
							link="/customize"
							onNavigate={ onChange }
						>
							<Gridicon icon="chevron-right" size={ 24 } onClick={ onChange } className="design-tool-list__button__icon" />
						</SidebarItem>
					);
	},

	render() {
		return (
			<div className="design-tool-list">
				<SidebarHeading>{ this.translate( 'Site Identity' ) }</SidebarHeading>
				<SidebarMenu>
					<ul>
						{ this.renderControl( { icon: 'heading', label: this.translate( 'Title and Tagline' ), value: 'siteTitle' } ) }
					</ul>
				</SidebarMenu>
			</div>
		);
	}
} );

export default DesignToolList;
