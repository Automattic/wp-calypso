/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import classnames from 'classnames';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import { clearCustomizations, fetchPreviewMarkup, saveCustomizations } from 'state/preview/actions';
import { isPreviewUnsaved, getPreviewCustomizations } from 'state/preview/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import accept from 'lib/accept';
import designTool from 'my-sites/design-menu/design-tool-data';
import DesignToolList from 'my-sites/design-tool-list';
import SiteTitleControl from 'my-sites/site-title';
import HeaderImageControl from 'my-sites/header-image';
import HomePageSettings from 'my-sites/home-page-settings';
import SiteLogoControl from 'my-sites/site-logo';
import DesignMenuPanel from 'my-sites/design-menu-panel';
import DesignMenuHeader from './design-menu-header';

const WrappedSiteTitleControl = designTool( SiteTitleControl );
const WrappedSiteLogoControl = designTool( SiteLogoControl );
const WrappedHeaderImageControl = designTool( HeaderImageControl );
const WrappedHomePageSettings = designTool( HomePageSettings );

const DesignMenu = React.createClass( {

	propTypes: {
		isVisible: React.PropTypes.bool,
		// These are provided by the connect method
		isUnsaved: React.PropTypes.bool,
		customizations: React.PropTypes.object,
		selectedSite: React.PropTypes.object,
		clearCustomizations: React.PropTypes.func.isRequired,
		fetchPreviewMarkup: React.PropTypes.func.isRequired,
		saveCustomizations: React.PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			isVisible: false,
			isUnsaved: false,
			customizations: {},
		};
	},

	getInitialState() {
		return {
			activeDesignToolId: null,
		};
	},

	componentWillMount() {
		if ( ! this.props.selectedSite ) {
			return;
		}
		this.props.clearCustomizations( this.props.selectedSite.ID );
		// Fetch the preview
		this.props.fetchPreviewMarkup( this.props.selectedSite.ID, '' );
	},

	activateDesignTool( activeDesignToolId ) {
		this.setState( { activeDesignToolId } );
	},

	activateDefaultDesignTool() {
		this.setState( { activeDesignToolId: null } );
	},

	onSave() {
		this.props.saveCustomizations();
	},

	onBack() {
		if ( this.state.activeDesignToolId ) {
			return this.activateDefaultDesignTool();
		}
		this.maybeCloseDesignMenu();
	},

	maybeCloseDesignMenu() {
		if ( ! this.props.selectedSite ) {
			return;
		}
		if ( this.props.isUnsaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					this.props.clearCustomizations( this.props.selectedSite.ID );
					this.closeDesignMenu();
				}
			} );
		}
		this.props.clearCustomizations( this.props.selectedSite.ID );
		this.closeDesignMenu();
	},

	closeDesignMenu() {
		if ( ! this.props.selectedSite ) {
			return;
		}
		const siteSlug = this.props.selectedSite.URL.replace( /^https?:\/\//, '' );
		page( `/stats/${siteSlug}` );
	},

	renderActiveDesignTool() {
		switch ( this.state.activeDesignToolId ) {
			case 'siteTitle':
				return (
					<DesignMenuPanel label={ this.translate( 'Title and Tagline' ) }>
						<WrappedSiteTitleControl previewDataKey="siteTitle" />
					</DesignMenuPanel>
				);
			case 'siteLogo':
				return (
					<DesignMenuPanel label={ this.translate( 'Logo' ) }>
						<WrappedSiteLogoControl previewDataKey="siteLogo" />
					</DesignMenuPanel>
				);
			case 'headerImage':
				return (
					<DesignMenuPanel label={ this.translate( 'Header Image' ) }>
						<WrappedHeaderImageControl previewDataKey="headerImage" />
					</DesignMenuPanel>
				);
			case 'homePage':
				return (
					<DesignMenuPanel label={ this.translate( 'Homepage Settings' ) }>
						<WrappedHomePageSettings previewDataKey="homePage" />
					</DesignMenuPanel>
				);
			default:
				return <DesignToolList onChange={ this.activateDesignTool } />;
		}
	},

	getSiteCardSite() {
		if ( ! this.props.selectedSite ) {
			return;
		}
		const newSiteTitle = get( this.props.customizations, 'siteTitle.blogname' );
		// The site object required by Site isn't quite the same as the one in the
		// Redux store, so we patch it.
		// TODO: remove this patch when Site can handle Redux data
		return Object.assign( {}, this.props.selectedSite, {
			title: newSiteTitle || this.props.selectedSite.name,
			domain: this.props.selectedSite.URL.replace( /^https?:\/\//, '' ),
		} );
	},

	render() {
		const classNames = classnames( 'design-menu', { 'is-visible': this.props.isVisible } );
		if ( ! this.props.selectedSite ) {
			return (
				<RootChild>
					<div className={ classNames }>
					</div>
				</RootChild>
			);
		}
		return (
			<RootChild>
				<div className={ classNames }>
					<DesignMenuHeader
						site={ this.getSiteCardSite() }
						isUnsaved={ this.props.isUnsaved }
						onBack={ this.onBack }
						onSave={ this.onSave }
					/>
					{ this.renderActiveDesignTool() }
				</div>
			</RootChild>
		);
	}
} );

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	return {
		selectedSite: getSelectedSite( state ),
		customizations: getPreviewCustomizations( state, siteId ),
		isUnsaved: isPreviewUnsaved( state, siteId ),
	};
}

export default connect(
	mapStateToProps,
	{ clearCustomizations, fetchPreviewMarkup, saveCustomizations }
)( DesignMenu );
