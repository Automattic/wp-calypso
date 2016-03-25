/**
 * External dependencies
 */
import React from 'react';

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
			<div className="design-menu-controls__control design-menu-controls__header-image-control">
				{ this.renderMediaModal() }
				<FormFieldset>
					<FormLabel htmlFor="header-image">{ this.translate( 'Current header' ) }</FormLabel>
					<div className="design-menu-controls__header-image-control__image-box">
						{ this.renderImage() }
					</div>
					<div className="design-menu-controls__header-image-control__buttons">
						{ this.renderButtons() }
					</div>
				</FormFieldset>
			</div>
		);
	}
} );

export default HeaderImageControl;
