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
	},

	renderControl( tool ) {
		const onChange = event => {
			event.preventDefault();
			this.props.onChange( tool.value );
		}
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
						{ this.renderControl( { icon: 'image', label: this.translate( 'Logo' ), value: 'siteLogo' } ) }
						{ this.renderControl( { icon: 'heading', label: this.translate( 'Title and Tagline' ), value: 'siteTitle' } ) }
					</ul>
				</SidebarMenu>
				<SidebarHeading>{ this.translate( 'Site Layout' ) }</SidebarHeading>
				<SidebarMenu>
					<ul>
						{ this.renderControl( { icon: 'house', label: this.translate( 'Homepage Settings' ), value: 'homePage' } ) }
						{ this.renderControl( { icon: 'image', label: this.translate( 'Header Image' ), value: 'headerImage' } ) }
					</ul>
				</SidebarMenu>
			</div>
		);
	}
} );

export default DesignToolList;
