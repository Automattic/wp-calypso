import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { filter, find } from 'lodash';
import { createRef, Component } from 'react';
import titleCase from 'to-title-case';
import ExternalLink from 'calypso/components/external-link';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';

import './style.scss';

class PluginSections extends Component {
	static displayName = 'PluginSections';

	constructor( props ) {
		super( props );
		this.descriptionContent = createRef();
	}

	state = {
		selectedSection: false,
		readMore: false,
		descriptionHeight: 0,
	};

	_COLLAPSED_DESCRIPTION_HEIGHT = 140;

	recordEvent = ( eventAction ) => {
		gaRecordEvent( 'Plugins', eventAction, 'Plugin Name', this.props.plugin.slug );
	};

	componentDidMount() {
		this.calculateDescriptionHeight();
	}

	componentDidUpdate() {
		this.calculateDescriptionHeight();
	}

	calculateDescriptionHeight() {
		if ( this.descriptionContent ) {
			const node = this.descriptionContent.current;
			if ( node && node.offsetHeight && node.offsetHeight !== this.state.descriptionHeight ) {
				this.setState( { descriptionHeight: node.offsetHeight } );
			}
		}
	}

	getFilteredSections = () => {
		if ( this.props.isWpcom ) {
			return this.getWpcomFilteredSections();
		}

		return [
			{
				key: 'description',
				title: this.props.translate( 'Description', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
			{
				key: 'installation',
				title: this.props.translate( 'Installation', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
			{
				key: 'changelog',
				title: this.props.translate( 'Changelog', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
			{
				key: 'faq',
				title: this.props.translate( 'FAQs', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
			{
				key: 'other_notes',
				title: this.props.translate( 'Other Notes', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
		];
	};

	getWpcomFilteredSections = () => {
		return [
			{
				key: 'description',
				title: this.props.translate( 'Description', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
			{
				key: 'faq',
				title: this.props.translate( 'FAQs', {
					context: 'Navigation item',
					textOnly: true,
				} ),
			},
		];
	};

	getWpcomSupportContent = () => {
		const supportedAuthors = [ 'Automattic', 'WooCommerce' ];
		const { translate, plugin } = this.props;

		if ( supportedAuthors.indexOf( plugin.author_name ) > -1 ) {
			return;
		}

		const linkToAuthor = (
			<ExternalLink href={ safeProtocolUrl( plugin.author_url ) } target="_blank">
				{ translate( 'Author website' ) }
			</ExternalLink>
		);

		const linkToSupportForum = (
			<ExternalLink
				href={ safeProtocolUrl( 'https://wordpress.org/support/plugin/' + plugin.slug ) }
				target="_blank"
			>
				{ translate( 'Support forum' ) }
			</ExternalLink>
		);

		return (
			<div className="plugin-sections__support">
				<h3>{ translate( 'Support' ) }</h3>
				<p>
					{ translate(
						'Support for this plugin is provided by the plugin author. You may find additional documentation here:'
					) }
				</p>
				<ul>
					<li>
						<span>{ linkToAuthor }</span>
					</li>
					<li>
						<span>{ linkToSupportForum }</span>
					</li>
				</ul>
			</div>
		);
	};

	getSelected = () => {
		return this.state.selectedSection || this.getDefaultSection();
	};

	getDefaultSection = () => {
		const sections = this.props.plugin.sections;
		return find( this.getFilteredSections(), function ( section ) {
			return sections[ section.key ];
		} ).key;
	};

	getAvailableSections = () => {
		const sections = this.props.plugin.sections;
		return filter( this.getFilteredSections(), function ( section ) {
			return sections[ section.key ];
		} );
	};

	getNavTitle = ( sectionKey ) => {
		const titleSection = find( this.getFilteredSections(), function ( section ) {
			return section.key === sectionKey;
		} );

		return titleSection && titleSection.title ? titleSection.title : titleCase( sectionKey );
	};

	setSelectedSection = ( section, event ) => {
		this.setState( {
			readMore: false !== this.state.readMore || this.getSelected() !== section,
			selectedSection: section,
		} );
		if ( event ) {
			this.recordEvent( 'Clicked Section Tab: ' + section );
		}
	};

	toggleReadMore = () => {
		this.setState( { readMore: ! this.state.readMore } );
	};

	renderReadMore = () => {
		if ( this.props.removeReadMore || this.props.isWpcom || this.state.descriptionHeight < this._COLLAPSED_DESCRIPTION_HEIGHT ) {
			return null;
		}
		const button = (
			<button className="plugin-sections__read-more-link" onClick={ this.toggleReadMore }>
				<span className="plugin-sections__read-more-text">
					{ this.props.translate( 'Read More' ) }
				</span>
				<Gridicon icon="chevron-down" size={ 18 } />
			</button>
		);
		return (
			<div className="plugin-sections__read-more">
				{
					// We remove the link but leave the plugin-sections__read-more container
					// in order to minimize jump on small sections.
					this.state.readMore ? null : button
				}
			</div>
		);
	};

	renderSelectedSection() {
		const contentClasses = classNames( 'plugin-sections__content', {
			trimmed: !this.props.removeReadMore && (! this.props.isWpcom && ! this.state.readMore),
		} );

		if (!this.props.addBanner || this.getSelected() !== 'description') {
			return <div
				ref={ this.descriptionContent }
				className={ contentClasses }
				// Sanitized in client/lib/plugins/utils.js with sanitizeHtml
				dangerouslySetInnerHTML={ {
					__html: this.props.plugin.sections[ this.getSelected() ],
				} }
			/>;
		}

		return <div ref={ this.descriptionContent } className={ contentClasses }>
			<div className="plugin-sections__banner">
				<img
					className="plugin-sections__banner-image"
					alt={ this.props.plugin.name }
					src={ this.props.plugin.banners.high || this.props.plugin.banners.low }
				/>
			</div>
			<div
				// Sanitized in client/lib/plugins/utils.js with sanitizeHtml
				dangerouslySetInnerHTML={{
					__html: this.props.plugin.sections[ this.getSelected() ],
				}}
			/>
		</div>;
	}

	render() {
		// Defensively check if this plugin has sections. If not, don't render anything.
		if ( ! this.props.plugin || ! this.props.plugin.sections || ! this.getAvailableSections() ) {
			return null;
		}

		/*eslint-disable react/no-danger*/
		return (
			<div className={ classNames( "plugin-sections", this.props.className )}>
				<div className="plugin-sections__header">
					<SectionNav selectedText={ this.getNavTitle( this.getSelected() ) }>
						<NavTabs>
							{ this.getAvailableSections().map( function ( section ) {
								return (
									<NavItem
										key={ section.key }
										onClick={ this.setSelectedSection.bind( this, section.key ) }
										selected={ this.getSelected() === section.key }
									>
										{ section.title }
									</NavItem>
								);
							}, this ) }
						</NavTabs>
					</SectionNav>
				</div>
				<Card>
					{ 'faq' === this.getSelected() && this.props.isWpcom && this.getWpcomSupportContent() }
					{ this.renderSelectedSection() }
					{ this.renderReadMore() }
				</Card>
			</div>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( PluginSections );
