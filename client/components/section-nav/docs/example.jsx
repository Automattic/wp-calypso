/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import forEach from 'lodash/forEach';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';

/**
 * Main
 */
var SectionNavigation = React.createClass( {
	displayName: 'SectionNav',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			basicTabsSelectedIndex: 0,
			manyTabsSelectedIndex: 0,
			siblingTabsSelectedIndex: 0,
			siblingSegmentedSelectedIndex: 0
		};
	},

	getDefaultProps: function() {
		return {
			basicTabs: [
				'Days',
				'Weeks',
				{
					name: 'Months',
					count: 45
				},
				{
					name: 'Years',
					count: 11
				}
			],
			manyTabs: [
				'Staff Picks',
				'Trending',
				'Blog',
				{
					name: 'Business',
					count: 8761
				},
				'Food',
				'Music',
				{
					name: 'Travel',
					count: 761
				},
				'Wedding',
				'Minimal',
				'Magazine',
				'Photography'
			],
			siblingTabs: [
				{
					name: 'Published',
					count: 8
				},
				'Scheduled',
				'Drafts',
				'Trashed'
			],
			siblingSegmented: [
				'Only Me',
				'Everyone'
			]
		};
	},

	render: function() {
		var demoSections = {};

		forEach( this.props, function( prop, key ) {
			demoSections[ key ] = [];

			if ( ! Array.isArray( prop ) ) {
				return;
			}

			prop.forEach( function( item, index ) {
				demoSections[ key ].push( (
					<NavItem
						key={ key + '-' + index }
						count={ item.count }
						selected={ this.state[ key + 'SelectedIndex' ] === index }
						onClick={ this.handleNavItemClick( key, index ) }
					>
						{ 'object' === typeof item ? item.name : item }
					</NavItem>
				) );
			}, this );
		}.bind( this ) );

		return (
			<DocsExample
				title="Section Navigation"
				url="/devdocs/design/section-nav"
				componentUsageStats={ this.props.getUsageStats( SectionNav ) }
			>
				<h3>Basic Tabs</h3>
				<SectionNav
					selectedText={ this.getSelectedText( 'basicTabs' ) }
					selectedCount={ this.getSelectedCount( 'basicTabs' ) }
				>
					<NavTabs>
						{ demoSections.basicTabs }
					</NavTabs>
				</SectionNav>

				<h3>Many Tabs</h3>
				<SectionNav
					selectedText={ this.getSelectedText( 'manyTabs' ) }
					selectedCount={ this.getSelectedCount( 'manyTabs' ) }
				>
					<NavTabs>
						{ demoSections.manyTabs }
					</NavTabs>
				</SectionNav>

				<h3>Sibling Control Groups</h3>
				<SectionNav selectedText={ this.getSiblingDemoSelectedText() }>
					<NavTabs
						label="Status"
						selectedText={ this.getSelectedText( 'siblingTabs' ) }
						selectedCount={ this.getSelectedCount( 'siblingTabs' ) }
					>
						{ demoSections.siblingTabs }
					</NavTabs>

					<NavSegmented label="author">
						{ demoSections.siblingSegmented }
					</NavSegmented>

					<Search
						pinned={ true }
						onSearch={ this.demoSearch }
						placeholder={ 'Search ' + this.getSelectedText( 'siblingTabs' ) + '...' }
					/>
				</SectionNav>
			</DocsExample>
		);
	},

	getSelectedText: function( section ) {
		var selected = this.state[ section + 'SelectedIndex' ],
			text = this.props[ section ][ selected ];

		return 'object' === typeof text ? text.name : text;
	},

	getSelectedCount: function( section ) {
		var selected = this.state[ section + 'SelectedIndex' ],
			selectedItem = this.props[ section ][ selected ];

		return 'object' === typeof selectedItem
			? selectedItem.count || null
			: null;
	},

	getSiblingDemoSelectedText: function() {
		return (
			<span>
				<span>{ this.getSelectedText( 'siblingTabs' ) }</span>
				<small>{ this.getSelectedText( 'siblingSegmented' ) }</small>
			</span>
		);
	},

	handleNavItemClick: function( section, index ) {
		return function() {
			var stateUpdate = {};

			stateUpdate[ section + 'SelectedIndex' ] = index;
			this.setState( stateUpdate );
		}.bind( this );
	},

	demoSearch: function( keywords ) {
		console.log( 'Section Nav Search (keywords):', keywords );
	}
} );

module.exports = SectionNavigation;
