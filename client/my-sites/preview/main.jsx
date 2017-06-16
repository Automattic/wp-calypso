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
import config from 'config';
import addQueryArgs from 'lib/route/add-query-args';

import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import WebPreviewContent from 'components/web-preview/content';

const debug = debugFactory( 'calypso:my-sites:preview' );

class PreviewMain extends React.Component {

	static displayName = 'Preview';

	state = {
		previewUrl: null,
	};

	componentWillMount() {
		console.log( this.props.site );
		this.updateUrl();
	}

	updateUrl() {
		if ( ! this.props.site ) {
			if ( this.state.previewUrl !== null ) {
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
			this.setState( { previewUrl: newUrl } );
		}
	}

	getBasePreviewUrl() {
		return this.props.site.options.unmapped_url;
	}

	componentDidMount() {
		console.log(this.props);
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.updateUrl();
		}
	}

	render() {
		const { translate } = this.props;

		return (
			<Main className="preview">
				<DocumentHead title={ translate( 'Site Preview' ) } />
				<WebPreviewContent
					showClose={ false }
					previewUrl={ this.state.previewUrl }
				/>
			</Main>
		);
	}
}

const mapState = ( state ) => ( {
	site: getSelectedSite( state ),
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapState )( localize( PreviewMain ) );
