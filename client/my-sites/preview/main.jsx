/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';
import { isSitePreviewable } from 'state/sites/selectors';
import addQueryArgs from 'lib/route/add-query-args';

import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import Gridicon from 'gridicons';
import Main from 'components/main';
import WebPreviewContent from 'components/web-preview/content';

const debug = debugFactory( 'calypso:my-sites:preview' );

class PreviewMain extends React.Component {

	static displayName = 'Preview';

	state = {
		previewUrl: null,
	};

	componentWillMount() {
		this.updateUrl();
	}

	updateUrl() {
		if ( ! this.props.site ) {
			if ( this.state.previewUrl !== null ) {
				debug( 'unloaded page' );
				this.setState( { previewUrl: null } );
			}
			return;
		}

		const newUrl = addQueryArgs( {
			preview: true,
			iframe: true,
			'frame-nonce': this.props.site.options.frame_nonce
		}, this.getBasePreviewUrl() );

		if ( this.iframeUrl !== newUrl ) {
			debug( 'loading', newUrl );
			this.setState( { previewUrl: newUrl } );
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

	render() {
		const { translate, isPreviewable, site } = this.props;

		if ( ! site ) {
			// todo: some loading state?
			return <span></span>;
		}

		if ( ! isPreviewable ) {
			const action = (
				<Button primary icon href={ site.URL } target="_blank">
					Open Externally
					<Gridicon icon="external" />
				</Button>
			);

			return (
				<EmptyContent
					title={ 'Site cannot be previewed here' }
					line={ 'Here we should say why…' }
					action={ action }
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					illustrationWidth={ 350 }
				/>
			);
		}

		return (
			<Main className="preview">
				<DocumentHead title={ translate( 'Site Preview' ) } />
				<WebPreviewContent
					showClose={ false }
					previewUrl={ this.state.previewUrl }
					externalUrl={ site.URL }
				/>
			</Main>
		);
	}
}

const mapState = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isPreviewable: isSitePreviewable( state, selectedSiteId ),
		site: getSelectedSite( state ),
		siteId: selectedSiteId,
	};
};

export default connect( mapState )( localize( PreviewMain ) );
