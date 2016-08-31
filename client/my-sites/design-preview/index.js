/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import page from 'page';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { fetchPreviewMarkup, undoCustomization } from 'state/preview/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/design-preview';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getPreviewUrl } from 'state/ui/preview/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getPreviewMarkup, getPreviewCustomizations, isPreviewUnsaved } from 'state/preview/selectors';
import { closePreview, setActiveDesignTool } from 'state/ui/preview/actions';
import DesignMenu from 'blocks/design-menu';
import { getSiteFragment } from 'lib/route/path';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const debug = debugFactory( 'calypso:design-preview' );

export default function designPreview( WebPreview ) {
	class DesignPreview extends React.Component {
		constructor( props ) {
			super( props );
			this.getCustomizations = this.getCustomizations.bind( this );
			this.shouldReloadPreview = this.shouldReloadPreview.bind( this );
			this.haveCustomizationsBeenRemoved = this.haveCustomizationsBeenRemoved.bind( this );
			this.loadPreview = this.loadPreview.bind( this );
			this.undoCustomization = this.undoCustomization.bind( this );
			this.onLoad = this.onLoad.bind( this );
			this.onClosePreview = this.onClosePreview.bind( this );
			this.cleanAndClosePreview = this.cleanAndClosePreview.bind( this );
			this.onPreviewClick = this.onPreviewClick.bind( this );
			this.addIcons = this.addIcons.bind( this );
		}

		componentDidMount() {
			this.loadPreview();
		}

		componentDidUpdate( prevProps ) {
			// If there is no markup or the site has changed, fetch it
			if ( ! this.props.previewMarkup || this.props.selectedSiteId !== prevProps.selectedSiteId ) {
				this.loadPreview();
			}
			// Refresh the preview when it is being shown (since this component is
			// always present but not always visible, this is similar to loading the
			// preview when mounting).
			if ( this.props.showPreview && ! prevProps.showPreview ) {
				this.loadPreview();
			}
			// If the customizations have been removed, restore the original markup
			if ( this.haveCustomizationsBeenRemoved( prevProps ) ) {
				// Force the initial markup to be restored because the DOM may have been
				// changed, and simply not applying customizations will not restore it.
				debug( 'restoring original markup' );
				this.loadPreview();
			}
			// Certain customizations cannot be applied by DOM changes, in which case we
			// can reload the preview.
			if ( this.shouldReloadPreview( prevProps ) ) {
				debug( 'reloading preview due to customizations' );
				this.loadPreview();
			}
			// Apply customizations as DOM changes
			if ( this.getCustomizations() && this.previewDocument ) {
				debug( 'updating preview with customizations', this.getCustomizations() );
				updatePreviewWithChanges( this.previewDocument, this.getCustomizations() );
			}
		}

		shouldReloadPreview( prevProps ) {
			const customizations = this.getCustomizations();
			const prevCustomizations = prevProps.customizations || {};
			return ( JSON.stringify( customizations.homePage ) !==
				JSON.stringify( prevCustomizations.homePage ) );
		}

		getCustomizations() {
			return this.props.customizations || {};
		}

		haveCustomizationsBeenRemoved( prevProps ) {
			return ( this.props.previewMarkup &&
				this.getCustomizations() &&
				this.props.previewMarkup === prevProps.previewMarkup &&
				prevProps.customizations &&
				Object.keys( this.getCustomizations() ).length === 0 &&
				Object.keys( prevProps.customizations ).length > 0
			);
		}

		loadPreview() {
			if ( ! this.props.selectedSite ) {
				return;
			}
			debug( 'loading preview with customizations', this.getCustomizations() );
			this.props.fetchPreviewMarkup( this.props.selectedSiteId, this.props.previewUrl, this.getCustomizations() );
		}

		undoCustomization() {
			this.props.undoCustomization( this.props.selectedSiteId );
		}

		onLoad( previewDocument ) {
			this.previewDocument = previewDocument;
			previewDocument.body.onclick = this.onPreviewClick;
			this.addIcons( previewDocument );
		}

		addIcons( previewDocument ) {
			const iconCss = `
.cdm-icon {
	fill: #fff;
	position: absolute;
	top: 0;
	left: 0;
	width: 30px;
	height: 30px;
	font-size: 18px;
	z-index: 5;
	background: #0087BE;
	border-radius: 50%;
	border: 2px solid #fff;
	box-shadow: 0 2px 1px rgba(46,68,83,0.15);
	text-align: center;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	animation-name: bounce-appear;
	animation-delay: 0.8s;
	animation-duration: 1s;
	animation-fill-mode: both;
	animation-duration: .75s;
}

.cdm-icon:hover {
	background: #00aadc;
	transition: background .15s ease-in-out;
}

.cdm-icon--hidden {
	display: none;
}

.cdm-icon svg {
	width: 18px;
	height: 18px;
}

.cdm-icon--text {
	margin-left: -2em;
}

.cdm-icon--header-image {
	margin: 10px;
}

@keyframes bounce-appear {
	from, 20%, 40%, 60%, 80%, to {
		animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
	}
	0% {
		opacity: 0;
		transform: scale3d(.3, .3, .3);
	}
	20% {
		transform: scale3d(1.1, 1.1, 1.1);
	}
	40% {
		transform: scale3d(.9, .9, .9);
	}
	60% {
		opacity: 1;
		transform: scale3d(1.03, 1.03, 1.03);
	}
	80% {
		transform: scale3d(.97, .97, .97);
	}
	to {
		opacity: 1;
		transform: scale3d(1, 1, 1);
	}
}
			`;
			const editIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M13 6l5 5-9.507 9.507c-.686-.686-.69-1.794-.012-2.485l-.002-.003c-.69.676-1.8.673-2.485-.013-.677-.677-.686-1.762-.036-2.455l-.008-.008c-.694.65-1.78.64-2.456-.036L13 6zm7.586-.414l-2.172-2.172c-.78-.78-2.047-.78-2.828 0L14 5l5 5 1.586-1.586c.78-.78.78-2.047 0-2.828zM3 18v3h3c0-1.657-1.343-3-3-3z"/></g></svg>'; // eslint-disable-line max-len
			const makeElement = config => config;
			const findElement = element => Object.assign( {}, element, { target: previewDocument.querySelector( element.selector ) } );
			const logElement = element => {
				debug( 'Attempting to add tool icon to element', element );
				return element;
			};
			const removeNotFound = element => !! element.target;
			const addIcon = element => {
				element.icon = previewDocument.createElement( 'div' );
				element.icon.className = 'cdm-icon cdm-icon--text';
				element.icon.innerHTML = editIcon;
				previewDocument.body.appendChild( element.icon );
				return element;
			};
			const maybeAddIcon = element => {
				return element.icon ? element : addIcon( element );
			};
			const getOffset = ( el ) => {
				el = el.getBoundingClientRect();
				return {
					left: el.left + previewDocument.defaultView.scrollX,
					top: el.top + previewDocument.defaultView.scrollY
				};
			};
			const positionIcon = element => {
				const left = getOffset( element.target ).left;
				const top = getOffset( element.target ).top;
				debug( 'positioning icon for', element, 'at', left, top );
				element.icon.style.left = `${left}px`;
				element.icon.style.top = `${top}px`;
				return element;
			};
			const addClickHandler = element => {
				element.icon.addEventListener( 'click', element.onClick );
				return element;
			};
			let elements = [
				makeElement( {
					id: 'siteTitle',
					selector: '.site-title a',
					onClick: () => this.props.setLayoutFocus( 'preview-sidebar' ) && this.props.setActiveDesignTool( 'siteTitle' ),
				} ),
			];
			const iconStyle = previewDocument.createElement( 'style' );
			iconStyle.innerHTML = iconCss;
			previewDocument.head.appendChild( iconStyle );
			const repositionIcons = () => {
				elements = elements
					.map( findElement )
					.map( logElement )
					.filter( removeNotFound )
					.map( maybeAddIcon )
					.map( positionIcon )
					.map( addClickHandler );
			};
			repositionIcons();
			setTimeout( repositionIcons, 2000 );
			previewDocument.addEventListener( 'scroll', repositionIcons, false );
			previewDocument.addEventListener( 'resize', repositionIcons, false );
		}

		onClosePreview() {
			if ( this.getCustomizations() && this.props.isUnsaved ) {
				const unsavedMessage =
					this.props.translate( 'You have unsaved changes. Are you sure you want to close the preview?' );
				return accept( unsavedMessage, accepted => {
					if ( accepted ) {
						this.cleanAndClosePreview();
					}
				} );
			}
			this.cleanAndClosePreview();
		}

		cleanAndClosePreview() {
			this.props.closePreview();
			const siteFragment = getSiteFragment( page.current );
			const isEmptyRoute = includes( page.current, '/customize' ) || includes( page.current, '/paladin' );
			// If this route has nothing but the preview, redirect to somewhere else
			if ( isEmptyRoute ) {
				page.redirect( `/stats/${siteFragment}` );
			}
		}

		onPreviewClick( event ) {
			debug( 'click detected for element', event.target );
			if ( ! event.target.href ) {
				return;
			}
			event.preventDefault();
		}

		render() {
			if ( ! this.props.selectedSite || ! this.props.selectedSite.is_previewable ) {
				debug( 'a preview is not available for this site' );
				return null;
			}
			const showSidebar = () => this.props.setLayoutFocus( 'preview-sidebar' );

			return (
				<div>
					<DesignMenu isVisible={ this.props.showPreview } />
					<WebPreview
						className={ this.props.className }
						showPreview={ this.props.showPreview }
						showExternal={ false }
						showClose={ false }
						hasSidebar={ true }
						previewMarkup={ this.props.previewMarkup }
						onClose={ this.onClosePreview }
						onLoad={ this.onLoad }
					>
						<button
							className="design-preview__mobile-show-sidebar"
							onClick={ showSidebar }
						>
							<Gridicon icon="arrow-left" />
							<span className="design-preview__mobile-show-sidebar-label">
								{ this.props.translate( 'EDIT' ) }
							</span>
						</button>
					</WebPreview>
				</div>
			);
		}
	}

	DesignPreview.propTypes = {
		className: PropTypes.string,
		showPreview: PropTypes.bool,
		customizations: PropTypes.object,
		isUnsaved: PropTypes.bool,
		previewMarkup: PropTypes.string,
		previewUrl: PropTypes.string,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		undoCustomization: PropTypes.func.isRequired,
		fetchPreviewMarkup: PropTypes.func.isRequired,
		closePreview: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		setActiveDesignTool: PropTypes.func.isRequired,
	};

	function mapStateToProps( state ) {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		const currentLayoutFocus = getCurrentLayoutFocus( state );

		return {
			selectedSite,
			selectedSiteId,
			selectedSiteUrl: getSiteOption( state, selectedSiteId, 'unmapped_url' ),
			previewUrl: getPreviewUrl( state ),
			previewMarkup: getPreviewMarkup( state, selectedSiteId ),
			customizations: getPreviewCustomizations( state, selectedSiteId ),
			isUnsaved: isPreviewUnsaved( state, selectedSiteId ),
			showPreview: currentLayoutFocus === 'preview' || currentLayoutFocus === 'preview-sidebar',
		};
	}

	return connect(
		mapStateToProps,
		{ fetchPreviewMarkup, undoCustomization, closePreview, setLayoutFocus, setActiveDesignTool }
	)( localize( DesignPreview ) );
}
