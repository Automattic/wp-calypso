/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ImageSelector from 'components/image-selector';

const SiteLogoControl = React.createClass( {
	propTypes: {
		site: React.PropTypes.object.isRequired,
		logoUrl: React.PropTypes.string,
		logoPostId: React.PropTypes.number,
		onChange: React.PropTypes.func.isRequired,
	},

	setImage( selectedItems ) {
		if ( selectedItems && selectedItems.length ) {
			const newImage = selectedItems[ 0 ];
			this.props.onChange( { logoUrl: newImage.URL, logoPostId: newImage.ID } );
		}
	},

	removeCurrentImage() {
		this.props.onChange( { logoUrl: null, logoPostId: null } );
	},

	render() {
		return (
			<div className="site-logo">
			<ImageSelector
			imagePostId={ this.props.logoPostId }
			onRemove={ this.removeCurrentImage }
			onSave={ this.setImage }
			label={ this.translate( 'Set Site Logo' ) }
			site={ this.props.site } />
			</div>
		);
	}
} );

export default SiteLogoControl;
