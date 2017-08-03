/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import classnames from 'classnames';
import get from 'lodash/get';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import { localize } from 'i18n-calypso';
import { clearCustomizations, fetchPreviewMarkup, saveCustomizations } from 'state/preview/actions';
import { isPreviewUnsaved, getPreviewCustomizations } from 'state/preview/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getActiveDesignTool } from 'state/ui/preview/selectors';
import { setActiveDesignTool, closePreview } from 'state/ui/preview/actions';
import accept from 'lib/accept';
import designTool from './design-tool-data';
import DesignToolList from './design-tool-list';
import SiteTitleControl from 'components/site-title';
import DesignMenuPanel from './design-menu-panel';
import DesignMenuHeader from './design-menu-header';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSiteFragment } from 'lib/route/path';

const WrappedSiteTitleControl = designTool( SiteTitleControl );

const DesignMenu = React.createClass( {

	propTypes: {
		isVisible: React.PropTypes.bool,
		// These are provided by the connect method
		isUnsaved: React.PropTypes.bool,
		customizations: React.PropTypes.object,
		selectedSite: React.PropTypes.object,
		currentLayoutFocus: React.PropTypes.string,
		activeDesignToolId: React.PropTypes.string,
		clearCustomizations: React.PropTypes.func.isRequired,
		fetchPreviewMarkup: React.PropTypes.func.isRequired,
		saveCustomizations: React.PropTypes.func.isRequired,
		setActiveDesignTool: React.PropTypes.func.isRequired,
		translate: React.PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			isVisible: false,
			isUnsaved: false,
			customizations: {},
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

	activateDefaultDesignTool() {
		this.props.setActiveDesignTool( null );
	},

	onSave() {
		this.props.saveCustomizations();
	},

	onBack() {
		if ( this.props.activeDesignToolId ) {
			return this.activateDefaultDesignTool();
		}
		this.maybeCloseDesignMenu();
	},

	maybeCloseDesignMenu() {
		if ( ! this.props.selectedSite ) {
			return;
		}
		if ( this.props.isUnsaved ) {
			const unsavedMessage =
				this.props.translate( 'You have unsaved changes. Are you sure you want to close the preview?' );
			return accept( unsavedMessage, accepted => {
				if ( accepted ) {
					this.cleanAndClosePreview();
				}
			} );
		}
		this.cleanAndClosePreview();
	},

	cleanAndClosePreview() {
		this.props.closePreview();
		const siteFragment = getSiteFragment( page.current );
		const isEmptyRoute = includes( page.current, '/customize' ) || includes( page.current, '/paladin' );
		// If this route has nothing but the preview, redirect to somewhere else
		if ( isEmptyRoute ) {
			page.redirect( `/stats/${siteFragment}` );
		}
	},

	renderActiveDesignTool() {
		switch ( this.props.activeDesignToolId ) {
			case 'siteTitle':
				return (
					<DesignMenuPanel label={ this.props.translate( 'Title and Tagline' ) }>
						<WrappedSiteTitleControl previewDataKey="siteTitle" />
					</DesignMenuPanel>
				);
			default:
				return <DesignToolList onChange={ this.props.setActiveDesignTool } />;
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
		const classNames = classnames( 'design-menu', {
			'is-visible': this.props.isVisible,
			'is-layout-preview-sidebar': this.props.currentLayoutFocus === 'preview-sidebar'
		} );
		if ( ! this.props.selectedSite ) {
			return <RootChild><div className={ classNames }/></RootChild>;
		}
		const onShowPreview = () => this.props.setLayoutFocus( 'preview' );
		return (
			<RootChild>
				<div className={ classNames }>
					<DesignMenuHeader
						site={ this.getSiteCardSite() }
						isUnsaved={ this.props.isUnsaved }
						onBack={ this.onBack }
						onSave={ this.onSave }
						onPreview={ onShowPreview }
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
		activeDesignToolId: getActiveDesignTool( state ),
		currentLayoutFocus: getCurrentLayoutFocus( state ),
	};
}

export default connect(
	mapStateToProps,
	{ clearCustomizations, fetchPreviewMarkup, saveCustomizations, setActiveDesignTool, setLayoutFocus, closePreview }
)( localize( DesignMenu ) );
