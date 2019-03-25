/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isSitePreviewable } from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { isWithinBreakpoint, isMobile, isDesktop } from 'lib/viewport';
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import Gridicon from 'gridicons';
import Main from 'components/main';
import {
	showInlineHelpPopover,
	showChecklistPrompt,
	showOnboardingWelcomePrompt,
} from 'state/inline-help/actions';
import WebPreview from 'components/web-preview';
import { recordTracksEvent } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:my-sites:preview' );

class PreviewMain extends React.Component {
	static displayName = 'Preview';

	state = {
		previewUrl: null,
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

		if ( this.props.welcome ) {
			this.props.showOnboardingWelcomePrompt();
		}

		if ( this.props.help || this.props.welcome ) {
			this.props.showInlineHelpPopover();
		}

		if ( this.props.checklist ) {
			this.props.showChecklistPrompt();
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
				} );
			}
			return;
		}

		const baseUrl = this.getBasePreviewUrl();
		const newUrl = addQueryArgs(
			{
				theme_preview: true,
				iframe: true,
				'frame-nonce': this.props.site.options.frame_nonce_preview,
			},
			baseUrl
		);

		if ( this.iframeUrl !== newUrl ) {
			debug( 'loading', newUrl );
			this.setState( {
				previewUrl: newUrl,
				externalUrl: this.props.site.URL,
			} );
		}
	}

	getBasePreviewUrl() {
		return this.props.site.options.unmapped_url;
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			debug( 'site change detected' );
			this.updateUrl();
		}
	}

	updateSiteLocation = pathname => {
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

const mapState = state => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isPreviewable: isSitePreviewable( state, selectedSiteId ),
		site: getSelectedSite( state ),
		siteId: selectedSiteId,
	};
};

export default connect(
	mapState,
	{
		recordTracksEvent,
		setLayoutFocus,
		showInlineHelpPopover,
		showChecklistPrompt,
		showOnboardingWelcomePrompt,
	}
)( localize( PreviewMain ) );
