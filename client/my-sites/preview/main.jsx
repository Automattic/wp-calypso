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
import { getSelectedSite, getSelectedSiteId } from 'client/state/ui/selectors';
import { isSitePreviewable } from 'client/state/sites/selectors';
import addQueryArgs from 'client/lib/route/add-query-args';
import { setLayoutFocus } from 'client/state/ui/layout-focus/actions';
import { isWithinBreakpoint } from 'client/lib/viewport';
import Button from 'client/components/button';
import DocumentHead from 'client/components/data/document-head';
import EmptyContent from 'client/components/empty-content';
import Gridicon from 'gridicons';
import Main from 'client/components/main';
import WebPreviewContent from 'client/components/web-preview/content';

const debug = debugFactory( 'calypso:my-sites:preview' );

class PreviewMain extends React.Component {
	static displayName = 'Preview';

	state = {
		previewUrl: null,
		externalUrl: null,
		showingClose: false,
	};

	componentWillMount() {
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
		global.window && global.window.addEventListener( 'resize', this.debouncedUpdateLayout );
	}

	componentWillUnmount() {
		global.window && global.window.removeEventListener( 'resize', this.debouncedUpdateLayout );
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
				'frame-nonce': this.props.site.options.frame_nonce,
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
		this.setState( {
			externalUrl: this.props.site.URL + ( pathname === '/' ? '' : pathname ),
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
				<WebPreviewContent
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

export default connect( mapState, { setLayoutFocus } )( localize( PreviewMain ) );
