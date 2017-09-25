/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

const icons = {
	aside: 'pages',
	image: 'image',
	video: 'video',
	quote: 'quote',
	link: 'link',
	gallery: 'image-multiple',
	audio: 'audio',
};

class PostFormat extends Component {
	static defaultProps = {
		format: 'standard',
		size: 24,
	}

	getIcon() {
		return icons[ this.props.format ];
	}

	getLabel() {
		const { format, translate } = this.props;
		switch ( format ) {
			case 'aside': return translate( 'Aside' );
			case 'image': return translate( 'Image' );
			case 'video': return translate( 'Video' );
			case 'quote': return translate( 'Quote' );
			case 'link': return translate( 'Link' );
			case 'gallery': return translate( 'Gallery' );
			case 'audio': return translate( 'Audio' );
		}
	}

	render() {
		const icon = this.getIcon();
		return icon
			? <span className="post-format__icon" title={ this.getLabel() }>
					<Gridicon
						icon={ icon }
						size={ this.props.size }
					/>
				</span>
			: null;
	}
}

export default localize( PostFormat );
