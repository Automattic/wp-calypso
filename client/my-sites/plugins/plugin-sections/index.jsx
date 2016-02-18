/**
 * External dependencies
 */
var React = require( 'react' ),
	titleCase = require( 'to-title-case' ),
	find = require( 'lodash/find' ),
	filter = require( 'lodash/filter' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	Card = require( 'components/card' ),
	PluginCardHeader = require( 'my-sites/plugins/plugin-card-header' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	descriptionHeight = 0;

module.exports = React.createClass( {

	_COLLAPSED_DESCRIPTION_HEIGHT: 140,

	displayName: 'PluginSections',

	recordEvent: function( eventAction ) {
		analytics.ga.recordEvent( 'Plugins', eventAction, 'Plugin Name', this.props.plugin.slug );
	},

	componentDidUpdate: function() {
		if ( this.refs.content ) {
			const node = this.refs.content;

			if ( node && node.offsetHeight ) {
				descriptionHeight = node.offsetHeight;
			}
		}
	},

	getFilteredSections: function() {
		return [
			{
				key: 'description',
				title: this.translate( 'Description', {
					context: 'Navigation item',
					textOnly: true
				} )
			},
			{
				key: 'installation',
				title: this.translate( 'Installation', {
					context: 'Navigation item',
					textOnly: true
				} )
			},
			{
				key: 'changelog',
				title: this.translate( 'Changelog', {
					context: 'Navigation item',
					textOnly: true
				} )
			},
			{
				key: 'faq',
				title: this.translate( 'FAQs', {
					context: 'Navigation item',
					textOnly: true
				} )
			},
			{
				key: 'other_notes',
				title: this.translate( 'Other Notes', {
					context: 'Navigation item',
					textOnly: true
				} )
			}
		];
	},

	getInitialState: function() {
		return {
			selectedSection: false,
			readMore: false
		};
	},

	getSelected: function() {
		return this.state.selectedSection || this.getDefaultSection();
	},

	getDefaultSection: function() {
		const sections = this.props.plugin.sections;
		return find( this.getFilteredSections(), function( section ) {
			return sections[ section.key ];
		} ).key;
	},

	getAvailableSections: function() {
		const sections = this.props.plugin.sections;
		return filter( this.getFilteredSections(), function( section ) {
			return sections[ section.key ];
		} );
	},

	getNavTitle: function( sectionKey ) {
		var titleSection = find( this.getFilteredSections(), function( section ) {
			return section.key === sectionKey;
		} );

		return ( titleSection && titleSection.title ) ? titleSection.title : titleCase( sectionKey );
	},

	setSelectedSection: function( section, event ) {
		this.setState( {
			readMore: false !== this.state.readMore || this.getSelected() !== section,
			selectedSection: section
		} );
		if ( event ) {
			this.recordEvent( 'Clicked Section Tab: ' + section );
		}
	},

	toggleReadMore: function() {
		this.setState( { readMore: ! this.state.readMore } );
	},

	renderReadMore: function() {
		if ( descriptionHeight < this._COLLAPSED_DESCRIPTION_HEIGHT ) {
			return null;
		}
		return (
			<div className="plugin-sections__read-more">
				{
					//
					// We remove the link but leave the plugin-sections__read-more container
					// in order to minimize jump on small sections.
					this.state.readMore ? null :
					<button className="plugin-sections__read-more-link" onClick={ this.toggleReadMore }>
						<span className="plugin-sections__read-more-text">
							{ this.translate( 'Read More' ) }
						</span>
					</button>
				}
			</div>
		);
	},

	render: function() {
		var contentClasses = classNames( 'plugin-sections__content', { trimmed: ! this.state.readMore } );

		// Defensively check if this plugin has sections. If not, don't render anything.
		if ( ! this.props.plugin || ! this.props.plugin.sections || ! this.getAvailableSections() ) {
			return null;
		}

		/*eslint-disable react/no-danger*/
		return (
			<div className="plugin-sections">
				<PluginCardHeader>
					<SectionNav selectedText={ this.getNavTitle( this.getSelected() ) }>
						<NavTabs>
							{
								this.getAvailableSections().map( function( section ) {
									return (
										<NavItem
											key={ section.key }
											onClick={ this.setSelectedSection.bind( this, section.key ) }
											selected={ this.getSelected() === section.key }
										>
											{ section.title }
										</NavItem>
									);
								}, this )
							}
						</NavTabs>
					</SectionNav>
				</PluginCardHeader>
				<Card>
					<div ref="content"
						className={ contentClasses }
						// Sanitized in client/lib/plugins/utils.js with sanitizeHtml
						dangerouslySetInnerHTML={ { __html: this.props.plugin.sections[ this.getSelected() ] } } />
					{ this.renderReadMore() }
				</Card>
			</div>
		);
		/*eslint-enable react/no-danger*/
	}
} );
