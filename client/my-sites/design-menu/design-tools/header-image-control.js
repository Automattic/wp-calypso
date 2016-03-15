/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import ImagePreloader from 'components/image-preloader';
import Button from 'components/button';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import EditorMediaModal from 'post-editor/media-modal';

const HeaderImageControl = React.createClass( {
	propTypes: {
		site: React.PropTypes.object.isRequired,
		headerImageUrl: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			isShowingMedia: false,
		};
	},

	onClickHide() {
		this.props.onChange( { headerImageUrl: null, headerImagePostId: null } );
	},

	onClickAdd() {
		this.setState( { isShowingMedia: true } );
	},

	setImage( selectedItems ) {
		if ( selectedItems && selectedItems.length ) {
			const newImage = selectedItems[0];
			this.props.onChange( { headerImageUrl: newImage.URL, headerImagePostId: newImage.ID, headerImageWidth: newImage.width, headerImageHeight: newImage.height } );
		}
		this.setState( { isShowingMedia: false } );
	},

	renderPlaceholder() {
		return <div>{ this.translate( 'Loading image' ) }</div>;
	},

	renderNoImage() {
		return <div>{ this.translate( 'No image set' ) }</div>;
	},

	renderImage() {
		if ( this.props.headerImageUrl ) {
			return <ImagePreloader placeholder={ this.renderPlaceholder() } src={ this.props.headerImageUrl } />;
		}
		return this.renderNoImage();
	},

	renderButtons() {
		const buttons = [
			<Button key="header-image-add" onClick={ this.onClickAdd }>{ this.translate( 'Add new image' ) }</Button>
		];
		if ( this.props.headerImageUrl ) {
			buttons.unshift(
				<Button key="header-image-hide" onClick={ this.onClickHide } >{ this.translate( 'Hide image' ) }</Button>
			);
		}
		return buttons;
	},

	renderMediaModal() {
		return (
			<MediaLibrarySelectedData siteId={ this.props.site.ID }>
				<EditorMediaModal
					visible={ this.state.isShowingMedia }
					onClose={ this.setImage }
					site={ this.props.site }
					labels={ { confirm: this.translate( 'Set Header Image' ) } }
					enabledFilters={ [ 'images' ] }
					single />
			</MediaLibrarySelectedData>
		);
	},

	render() {
		return (
			<div className="tailor-controls__control tailor-controls__header-image-control">
				{ this.renderMediaModal() }
				<FormFieldset>
					<FormLabel htmlFor="header-image">{ this.translate( 'Current header' ) }</FormLabel>
					<div className="tailor-controls__header-image-control__image-box">
						{ this.renderImage() }
					</div>
					<div className="tailor-controls__header-image-control__buttons">
						{ this.renderButtons() }
					</div>
				</FormFieldset>
			</div>
		);
	}
} );

function mapStateToProps( state ) {
	const { ui, tailor } = state;
	const siteId = ui.selectedSiteId;
	const selectedSite = state.sites.items[ siteId ] || {};
	if ( tailor.customizations.headerImage ) {
		return assign( { site: selectedSite }, tailor.customizations.headerImage );
	}
	const headerImagePostId = get( selectedSite, 'options.header_image.attachment_id' );
	const headerImageUrl = get( selectedSite, 'options.header_image.url' );
	const headerImageWidth = get( selectedSite, 'options.header_image.width' );
	const headerImageHeight = get( selectedSite, 'options.header_image.height' );
	return { site: selectedSite, headerImagePostId, headerImageUrl, headerImageWidth, headerImageHeight };
}

export default connect( mapStateToProps )( HeaderImageControl );
