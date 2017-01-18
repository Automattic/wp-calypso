/* eslint-disable react/no-danger  */

/**
 * External dependencies
 */
import React from 'react';
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Card from 'components/card';
import { isValidTerm } from 'my-sites/themes/theme-filters';
import SectionHeader from 'components/section-header';
import ThemeDownloadCard from '../theme-download-card';
import ThemesRelatedCard from '../themes-related-card';
import Button from 'components/button';

class ThemeSheetContent extends React.Component {
	static propTypes = {
		section: React.PropTypes.string,
		isJetpack: React.PropTypes.bool,
		togglePreview: React.PropTypes.func,
		siteSlug: React.PropTypes.string,
		id: React.PropTypes.string,
		isLoaded: React.PropTypes.bool,
		isCurrentUserPaid: React.PropTypes.bool,
		theme: React.PropTypes.object,
	};

	getValidSections() {
		const { theme } = this.props;
		const validSections = [];
		validSections.push( '' ); // Default section
		theme && theme.supportDocumentation && validSections.push( 'setup' );
		validSections.push( 'support' );
		return validSections;
	}

	validateSection( section ) {
		if ( this.getValidSections().indexOf( section ) === -1 ) {
			return this.getValidSections()[ 0 ];
		}
		return section;
	}

	renderScreenshot() {
		let screenshot;
		if ( this.props.isJetpack ) {
			screenshot = this.props.theme.screenshot;
		} else {
			screenshot = this.getFullLengthScreenshot();
		}
		const img = screenshot && <img className="theme__sheet-img" src={ screenshot + '?=w680' } />;
		return (
			<div className="theme__sheet-screenshot">
				{ this.props.theme.demo_uri && this.renderPreviewButton() }
				{ img }
			</div>
		);
	}

	renderPreviewButton() {
		const { togglePreview, translate } = this.props;

		return (
			<a className="theme__sheet-preview-link" onClick={ togglePreview } data-tip-target="theme-sheet-preview">
				<Gridicon icon="themes" size={ 18 } />
				<span className="theme__sheet-preview-link-text">
					{ translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
				</span>
			</a>
		);
	}

	renderSectionNav( currentSection ) {
		const { translate, siteSlug, id, isLoaded } = this.props;

		const filterStrings = {
			'': translate( 'Overview', { context: 'Filter label for theme content' } ),
			setup: translate( 'Setup', { context: 'Filter label for theme content' } ),
			support: translate( 'Support', { context: 'Filter label for theme content' } ),
		};

		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nav = (
			<NavTabs label="Details" >
				{ this.getValidSections().map( ( section ) => (
					<NavItem key={ section }
						path={ `/theme/${ id }${ section ? '/' + section : '' }${ sitePart }` }
						selected={ section === currentSection }>
						{ filterStrings[ section ] }
					</NavItem>
				) ) }
			</NavTabs>
		);

		return (
			<SectionNav className="theme__sheet-section-nav" selectedText={ filterStrings[ currentSection ] }>
				{ isLoaded && nav }
			</SectionNav>
		);
	}

	renderSectionContent( section ) {
		return {
			'': this.renderOverviewTab(),
			setup: this.renderSetupTab(),
			support: this.renderSupportTab(),
		}[ section ];
	}

	renderOverviewTab() {
		return (
			<div>
				<Card className="theme__sheet-content">
					{ this.renderDescription() }
				</Card>
				{ this.renderFeaturesCard() }
				{ this.renderDownload() }
				{ ! this.props.isJetpack && <ThemesRelatedCard currentTheme={ this.props.id } /> }
			</div>
		);
	}

	renderDescription() {
		if ( this.props.theme.descriptionLong ) {
			return (
				<div dangerouslySetInnerHTML={ { __html: this.props.theme.descriptionLong } } />
			);
		}
		// description doesn't contain any formatting, so we don't need to dangerouslySetInnerHTML
		return <div>{ this.props.theme.description }</div>;
	}

	renderFeaturesCard() {
		const { isJetpack, siteSlug, translate } = this.props;
		const { taxonomies } = this.props.theme;

		if ( ! taxonomies || ! isArray( taxonomies.theme_feature ) ) {
			return null;
		}

		const themeFeatures = taxonomies.theme_feature.map( function( item ) {
			const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
			return (
				<li key={ 'theme-features-item-' + item.slug }>
					{ isJetpack
						? <a>{ item.name }</a>
						: <a href={ `/design/filter/${ term }/${ siteSlug || '' }` }>{ item.name }</a>
					}
				</li>
			);
		} );

		return (
			<div>
				<SectionHeader label={ translate( 'Features' ) } />
				<Card>
					<ul className="theme__sheet-features-list">
						{ themeFeatures }
					</ul>
				</Card>
			</div>
		);
	}

	getFullLengthScreenshot() {
		if ( this.props.isLoaded ) {
			return this.props.theme.screenshots[ 0 ];
		}
		return null;
	}

	renderDownload() {
		// Don't render download button:
		// * If it's a premium theme
		// * If it's on a Jetpack site, and the theme object doesn't have a 'download' attr
		//   Note that not having a 'download' attr would be permissible for a theme on WPCOM
		//   since we don't provide any for some themes found on WordPress.org (notably the 'Twenties').
		//   The <ThemeDownloadCard /> component can handle that case.
		if ( this.props.isPremium || ( this.props.isJetpack && ! this.props.theme.download ) ) {
			return null;
		}
		return <ThemeDownloadCard theme={ this.props.id } href={ this.props.theme.download } />;
	}

	renderSetupTab() {
		return (
			<div>
				<Card className="theme__sheet-content">
					<div dangerouslySetInnerHTML={ { __html: this.props.theme.supportDocumentation } } />
				</Card>
			</div>
		);
	}

	renderContactUsCard( isPrimary = false ) {
		const { translate } = this.props;

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="help-outline" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ translate( 'Need extra help?' ) }
					<small>{ translate( 'Get in touch with our support team' ) }</small>
				</div>
				<Button primary={ isPrimary } href={ '/help/contact/' }>Contact us</Button>
			</Card>
		);
	}

	renderThemeForumCard( isPrimary = false ) {
		const { translate } = this.props;

		if ( ! this.props.theme.forumUrl ) {
			return null;
		}

		const description = this.props.isPremium
			? translate( 'Get in touch with the theme author' )
			: translate( 'Get help from volunteers and staff' );

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="comment" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ translate( 'Have a question about this theme?' ) }
					<small>{ description }</small>
				</div>
				<Button primary={ isPrimary } href={ this.props.theme.forumUrl }>Visit forum</Button>
			</Card>
		);
	}

	renderCssSupportCard() {
		const { translate } = this.props;

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="briefcase" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ translate( 'Need CSS help? ' ) }
					<small>{ translate( 'Get help from the experts in our CSS forum' ) }</small>
				</div>
				<Button href="//en.forums.wordpress.com/forum/css-customization">Visit forum</Button>
			</Card>
		);
	}

	renderSupportTab() {
		if ( this.props.isCurrentUserPaid ) {
			return (
				<div>
					{ this.renderContactUsCard( true ) }
					{ this.renderThemeForumCard() }
					{ this.renderCssSupportCard() }
				</div>
			);
		}

		return (
			<div>
				{ this.renderThemeForumCard( true ) }
				{ this.renderCssSupportCard() }
			</div>
		);
	}

	render() {
		const section = this.validateSection( this.props.section );

		return (
			<div className="theme__sheet-columns">
				<div className="theme__sheet-column-left">
					<div className="theme__sheet-content">
						{ this.renderSectionNav( section ) }
						{ this.renderSectionContent( section ) }
						<div className="theme__sheet-footer-line"><Gridicon icon="my-sites" /></div>
					</div>
				</div>
				<div className="theme__sheet-column-right">
					{ this.renderScreenshot() }
				</div>
			</div>
		);
	}
}

export default localize( ThemeSheetContent );
