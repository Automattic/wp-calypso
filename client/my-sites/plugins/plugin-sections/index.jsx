import { ExternalLink } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { filter, find } from 'lodash';
import { createRef, Component } from 'react';
import titleCase from 'to-title-case';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';
import { PluginFeaturedVideo } from '../plugin-featured-video';

import './style.scss';

class PluginSections extends Component {
	static displayName = 'PluginSections';

	constructor( props ) {
		super( props );
		this.descriptionContent = createRef();
	}

	state = {
		selectedSection: false,
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
			return sections?.[ section.key ];
		} )?.key;
	};

	getAvailableSections = () => {
		const sections = this.props.plugin.sections;
		return filter( this.getFilteredSections(), function ( section ) {
			return sections?.[ section.key ];
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
			selectedSection: section,
		} );
		if ( event ) {
			this.recordEvent( 'Clicked Section Tab: ' + section );
		}
	};

	renderSelectedSection() {
		const contentClasses = clsx( 'plugin-sections__content' );
		const banner = this.props.plugin?.banners?.high || this.props.plugin?.banners?.low;
		const videoUrl = this.props.plugin?.banner_video_src;

		/*eslint-disable react/no-danger*/
		if (
			! this.props.addBanner ||
			( ! banner && ! videoUrl ) ||
			this.getSelected() !== 'description'
		) {
			return (
				<div
					ref={ this.descriptionContent }
					className={ contentClasses }
					// Sanitized in client/lib/plugins/utils.ts with sanitizeHtml
					dangerouslySetInnerHTML={ {
						__html: this.props.plugin.sections[ this.getSelected() ],
					} }
				/>
			);
		}

		if ( videoUrl ) {
			return (
				<div ref={ this.descriptionContent } className={ contentClasses }>
					<div className="plugin-sections__banner">
						<PluginFeaturedVideo
							id="product-video-iframe"
							src={ videoUrl }
							productName={ this.props.plugin.name }
						/>
					</div>
					<div
						// Sanitized in client/lib/plugins/utils.ts with sanitizeHtml
						dangerouslySetInnerHTML={ {
							__html: this.props.plugin.sections[ this.getSelected() ],
						} }
					/>
				</div>
			);
		}

		return (
			<div ref={ this.descriptionContent } className={ contentClasses }>
				<div className="plugin-sections__banner">
					<img
						className="plugin-sections__banner-image"
						alt={ this.props.plugin.name }
						src={ banner }
					/>
				</div>

				<div
					// Sanitized in client/lib/plugins/utils.ts with sanitizeHtml
					dangerouslySetInnerHTML={ {
						__html: this.props.plugin.sections[ this.getSelected() ],
					} }
				/>
			</div>
		);
		/*eslint-enable react/no-danger*/
	}

	render() {
		const availableSections = this.getAvailableSections();
		// Defensively check if this plugin has sections. If not, don't render anything.
		if (
			! this.props.plugin ||
			! this.props.plugin.sections ||
			! availableSections ||
			! this.getSelected()
		) {
			return null;
		}

		const hasOnlyDescriptionSection =
			availableSections.length === 1 &&
			availableSections.find( ( section ) => section.key === 'description' );

		return (
			<div className="plugin-sections">
				{ ! hasOnlyDescriptionSection && (
					<div className="plugin-sections__header">
						<SectionNav selectedText={ this.getNavTitle( this.getSelected() ) }>
							<NavTabs>
								{ availableSections.map( function ( section ) {
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
				) }
				{ 'faq' === this.getSelected() && this.props.isWpcom && this.getWpcomSupportContent() }
				{ this.renderSelectedSection() }
			</div>
		);
	}
}

export default localize( PluginSections );
