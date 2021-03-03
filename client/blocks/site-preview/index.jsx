/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { closePreview } from 'calypso/state/ui/preview/actions';
import {
	getPreviewSite,
	getPreviewSiteId,
	getPreviewUrl,
} from 'calypso/state/ui/preview/selectors';
import { getSiteOption, getSiteSlug } from 'calypso/state/sites/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { addQueryArgs } from 'calypso/lib/route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import WebPreview from 'calypso/components/web-preview';

const debug = debugFactory( 'calypso:site-preview' );

class SitePreview extends Component {
	static propTypes = {
		className: PropTypes.string,
		showPreview: PropTypes.bool,
		previewUrl: PropTypes.string,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteNonce: PropTypes.string,
		selectedSiteUrl: PropTypes.string,
		closePreview: PropTypes.func.isRequired,
	};

	state = {
		previewCount: 0,
	};

	previewCounter = 0;

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedSiteId && this.props.selectedSiteId !== nextProps.selectedSiteId ) {
			this.previewCounter = 0;
		}

		if ( ! this.props.showPreview && nextProps.showPreview ) {
			debug( 'forcing refresh' );
			this.previewCounter > 0 && this.setState( { previewCount: this.previewCounter } );
			this.previewCounter += 1;
		}
	}

	getPreviewUrl() {
		if ( ! this.props.selectedSiteUrl && ! this.props.previewUrl ) {
			debug( 'no preview url and no site url were found for this site' );
			return null;
		}
		const previewUrl = addQueryArgs(
			{
				iframe: true,
				theme_preview: true,
				'frame-nonce': this.props.selectedSiteNonce,
				cachebust: this.state.previewCount,
			},
			this.getBasePreviewUrl()
		);
		debug( 'using this preview url', previewUrl );
		return previewUrl;
	}

	getBasePreviewUrl() {
		return this.props.previewUrl || this.props.selectedSiteUrl;
	}

	render() {
		if ( ! this.props.selectedSite || ! this.props.selectedSite.is_previewable ) {
			debug( 'a preview is not available for this site' );
			return null;
		}

		return (
			<WebPreview
				className={ this.props.className }
				previewUrl={ this.getPreviewUrl() }
				externalUrl={ this.getBasePreviewUrl() }
				showExternal={ true }
				showClose={ true }
				showPreview={ this.props.showPreview }
				onClose={ this.props.closePreview }
				showSEO={ ! this.props.isDomainOnlySite }
			/>
		);
	}
}

function mapStateToProps( state ) {
	const selectedSiteId = getPreviewSiteId( state );
	// Force https to prevent mixed content errors in the iframe
	const siteUrl = 'https://' + getSiteSlug( state, selectedSiteId );

	return {
		showPreview: getCurrentLayoutFocus( state ) === 'preview',
		selectedSite: getPreviewSite( state ),
		selectedSiteId,
		selectedSiteUrl: siteUrl.replace( /::/g, '/' ),
		selectedSiteNonce: getSiteOption( state, selectedSiteId, 'frame_nonce' ) || '',
		previewUrl: getPreviewUrl( state ),
		isDomainOnlySite: isDomainOnlySite( state, selectedSiteId ),
	};
}

export default connect( mapStateToProps, { closePreview } )( SitePreview );
