/**
 * External dependencies
 */
import { isWithinBreakpoint, isMobile, isDesktop } from '@automattic/viewport';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { debounce, get } from 'lodash';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteOption, isSitePreviewable } from 'calypso/state/sites/selectors';
import { addQueryArgs } from 'calypso/lib/route';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { Button } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import Gridicon from 'calypso/components/gridicon';
import Main from 'calypso/components/main';
import { showInlineHelpPopover } from 'calypso/state/inline-help/actions';
import WebPreview from 'calypso/components/web-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Internal dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:my-sites:preview' );

class PreviewMain extends React.Component {
	static displayName = 'Preview';

	state = {
		previewUrl: null,
		editUrl: null,
		externalUrl: null,
		showingClose: false,
		// Set to one of the possible default values in client/components/web-preview/toolbar.jsx
		device: isMobile() // eslint-disable-line no-nested-ternary
			? 'phone'
			: isDesktop()
			? 'computer'
			: 'tablet',
	};

	UNSAFE_componentWillMount() {
		this.updateUrl();
		this.updateLayout();
	}

	updateLayout = () => {
		this.setState( {
			showingClose: isWithinBreakpoint( '<660px' ),
		} );
	};

	debouncedUpdateLayout = debounce( this.updateLayout, 50 );

	componentDidMount() {
		if ( typeof window !== 'undefined' ) {
			window.addEventListener( 'resize', this.debouncedUpdateLayout );
		}

		if ( this.props.help ) {
			this.props.showInlineHelpPopover();
		}
	}

	componentWillUnmount() {
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'resize', this.debouncedUpdateLayout );
		}
	}

	updateUrl() {
		if ( ! this.props.site ) {
			if ( this.state.previewUrl !== null ) {
				debug( 'unloaded page' );
				this.setState( {
					previewUrl: null,
					externalUrl: null,
					editUrl: null,
				} );
			}
			return;
		}

		const { selectedSiteNonce } = this.props;
		const baseUrl = this.getBasePreviewUrl();
		const newUrl = addQueryArgs(
			{
				theme_preview: true,
				iframe: true,
				'frame-nonce': selectedSiteNonce,
			},
			baseUrl
		);

		if ( this.iframeUrl !== newUrl ) {
			debug( 'loading', newUrl );
			this.setState( {
				previewUrl: newUrl,
				externalUrl: this.props.site.URL,
				editUrl: this.getEditButtonURL(),
			} );
		}
	}

	getBasePreviewUrl() {
		return this.props.site.options.unmapped_url;
	}

	showEditButton = () => {
		if ( 'posts' === get( this.props.site, [ 'options', 'show_on_front' ] ) ) {
			return false;
		}

		if ( ! this.props.canEditPages ) {
			return false;
		}

		return true;
	};

	getEditButtonURL() {
		if ( this.showEditButton() ) {
			return this.props.editorURL;
		}

		return null;
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			debug( 'site change detected' );
			this.updateUrl();
		}
	}

	updateSiteLocation = ( pathname ) => {
		const externalUrl = this.props.site.URL + ( pathname === '/' ? '' : pathname );
		this.setState( { externalUrl } );
		this.props.recordTracksEvent( 'calypso_view_site_page_view', {
			full_url: externalUrl,
			pathname,
		} );
	};

	focusSidebar = () => {
		this.props.setLayoutFocus( 'sidebar' );
	};

	render() {
		const { translate, isPreviewable, site } = this.props;

		if ( ! site ) {
			// todo: some loading state?
			return null;
		}

		if ( ! isPreviewable ) {
			const action = (
				<Button primary icon href={ site.URL } target="_blank">
					{ translate( 'Open' ) } <Gridicon icon="external" />
				</Button>
			);

			return (
				<EmptyContent
					title={ translate( 'Unable to show your site here' ) }
					line={ translate( 'To view your site, click the button below' ) }
					action={ action }
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					illustrationWidth={ 350 }
				/>
			);
		}

		return (
			<Main className="preview">
				<DocumentHead title={ translate( 'Your Site' ) } />
				<WebPreview
					showPreview
					isContentOnly
					onLocationUpdate={ this.updateSiteLocation }
					showUrl={ !! this.state.externalUrl }
					showClose={ this.state.showingClose }
					onClose={ this.focusSidebar }
					showEdit={ this.showEditButton() }
					editUrl={ this.state.editUrl }
					previewUrl={ this.state.previewUrl }
					externalUrl={ this.state.externalUrl }
					loadingMessage={ this.props.translate(
						'{{strong}}One moment, please…{{/strong}} loading your site.',
						{ components: { strong: <strong /> } }
					) }
					defaultViewportDevice={ this.state.device }
				/>
			</Main>
		);
	}
}

const mapState = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const homePagePostId = get( site, [ 'options', 'page_on_front' ] );

	return {
		isPreviewable: isSitePreviewable( state, selectedSiteId ),
		selectedSiteNonce: getSiteOption( state, selectedSiteId, 'frame_nonce' ) || '',
		site: site,
		siteId: selectedSiteId,
		canEditPages: canCurrentUser( state, selectedSiteId, 'edit_pages' ),
		editorURL: getEditorUrl( state, selectedSiteId, homePagePostId, 'page' ),
	};
};

export default connect( mapState, {
	recordTracksEvent,
	setLayoutFocus,
	showInlineHelpPopover,
} )( localize( PreviewMain ) );
