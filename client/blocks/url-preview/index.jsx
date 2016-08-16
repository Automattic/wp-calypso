/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { closePreview } from 'state/ui/preview/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getPreviewUrl } from 'state/ui/preview/selectors';
import { getSiteOption } from 'state/sites/selectors';
import addQueryArgs from 'lib/route/add-query-args';

const debug = debugFactory( 'calypso:design-preview' );

export default function urlPreview( WebPreview ) {
	class UrlPreview extends React.Component {
		constructor( props ) {
			super( props );
			this.state = { previewCount: 0 };
			this.previewCounter = 0;
			this.onClosePreview = this.onClosePreview.bind( this );
			this.getPreviewUrl = this.getPreviewUrl.bind( this );
			this.getBasePreviewUrl = this.getBasePreviewUrl.bind( this );
		}

		componentWillReceiveProps( nextProps ) {
			if ( this.props.selectedSiteId && this.props.selectedSiteId !== nextProps.selectedSiteId ) {
				this.previewCounter = 0;
			}

			if ( ! this.props.showPreview && nextProps.showPreview ) {
				debug( 'forcing refresh' );
				this.previewCounter > 0 && this.setState( { previewCount: this.previewCounter } );
				this.previewCounter += 1;
			}
		}

		onClosePreview() {
			this.props.closePreview();
		}

		getPreviewUrl() {
			if ( ! this.props.selectedSiteUrl && ! this.props.previewUrl ) {
				debug( 'no preview url and no site url were found for this site' );
				return null;
			}
			const previewUrl = addQueryArgs( {
				iframe: true,
				theme_preview: true,
				'frame-nonce': this.props.selectedSiteNonce,
				cachebust: this.state.previewCount,
			}, this.getBasePreviewUrl() );
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
					onClose={ this.onClosePreview }
				/>
			);
		}
	}

	UrlPreview.propTypes = {
		className: PropTypes.string,
		showPreview: PropTypes.bool,
		previewUrl: PropTypes.string,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteNonce: PropTypes.string,
		selectedSiteUrl: PropTypes.string,
		closePreview: PropTypes.func.isRequired,
	};

	function mapStateToProps( state ) {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			selectedSite: getSelectedSite( state ),
			selectedSiteId,
			selectedSiteUrl: getSiteOption( state, selectedSiteId, 'unmapped_url' ),
			selectedSiteNonce: getSiteOption( state, selectedSiteId, 'frame_nonce' ),
			previewUrl: getPreviewUrl( state ),
		};
	}

	return connect(
		mapStateToProps,
		{ closePreview }
	)( UrlPreview );
}
