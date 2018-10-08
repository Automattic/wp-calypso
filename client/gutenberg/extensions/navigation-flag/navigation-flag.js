/** @format */

/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl } from '@wordpress/components';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { InspectorControls } from '@wordpress/editor';

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

import StoryIcons from 'gutenberg/extensions/shared/atavist/subcomponents/story-icons';
import Search from 'gutenberg/extensions/shared/atavist/subcomponents/search';
import './store';

class NavigationFlag extends Component {

	render() {
		const { organization, children, menu_slug, admin, onChangeMenuSlug } = this.props;
		const { url, name, logo } = organization;
		const menuSelect = [];
		if ( organization.menus ) {
			for ( const i in organization.menus ) {
				menuSelect.push( {
					label: organization.menus[ i ].name,
					value: i,
				} );
			}
		}
		const menu = get( organization, 'menus.' + menu_slug + '.markup' );
		const inspectorControls = admin ? (
			<InspectorControls>
				<PanelBody title={ __( 'Navigation Options' ) }>
					<SelectControl
						label={ __( 'Menu' ) }
						value={ menu_slug }
						onChange={ value => onChangeMenuSlug( value ) }
						options={ menuSelect }
					/>
				</PanelBody>
			</InspectorControls>
		) : null;
		return (
			<Fragment>
				{ inspectorControls }
				<nav class="solid-nav-bar light-nav">
					<div class="bar">
						<div class="mobile-nav-button container">
							<div class="nav-menu-button template-icon">
								<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
									<g id="Page-1" fill="none">
										<rect id="Rectangle-1" width="40" height="40" rx="4" />
										<g id="hamburger-button" transform="translate(6 10)">
											<path
												d="M0,3 L28,3 L28,0 L0,0 L0,3 L0,3 Z M0,12 L28,12 L28,9 L0,9 L0,12 L0,12 Z M0,21 L28,21 L28,18 L0,18 L0,21 L0,21 Z"
												id="Page-1"
											/>
										</g>
									</g>
								</svg>
							</div>
						</div>
						<div className="logo-container container }">
							<a href={ url } target="_self">
								{ logo ? (
									<img class="logo" src={ logo } alt={ name } />
								) : (
									<h1 class="needs-accent-color">{ name }</h1>
								) }
							</a>
						</div>
						<div class="menu-container container needs-accent-color">
							<RawHTML className="atavist-menu">{ menu }</RawHTML>
						</div>
						<div class="search-container container">
							<Search />
						</div>
						<div class="nav-container horizontal-nav-icons container">
							<StoryIcons />
						</div>
					</div>
				</nav>
				<nav class="mobile">
					<div class="bar">
						<div class="mobile-nav-button container">
							<div class="nav-menu-button template-icon">
								<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M19.9990585,22.6172617 L27.4228429,30.041046 L29.5441632,27.9197257 L22.1203789,20.4959414 L29.5441632,13.072157 L27.4228429,10.9508367 L19.9990585,18.374621 L12.5752742,10.9508367 L10.4539538,13.072157 L17.8777382,20.4959414 L10.4539538,27.9197257 L12.5752742,30.041046 L19.9990585,22.6172617 Z"
										fill="none"
									/>
								</svg>
							</div>
						</div>
					</div>
					<div class="menu-container non-mobile needs-accent-color">
						<RawHTML className="atavist-menu">{ menu }</RawHTML>
					</div>
					<div class="search-container non-mobile">
						<Search />
					</div>
				</nav>
				{ children }
			</Fragment>
		);
	}
}

export default withSelect( select => {
	return {
		organization: select( 'atavist/site-options' ).receiveOrganization(),
	};
} )( NavigationFlag );
