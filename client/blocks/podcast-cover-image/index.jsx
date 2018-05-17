/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Image from 'components/image';
import Spinner from 'components/spinner';
import QuerySites from 'components/data/query-sites';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isTransientMedia } from 'state/selectors';
import {
	getPodcastingCoverImageUrl,
	getPodcastingCoverImageId,
} from 'state/selectors/get-podcasting-cover-image';
import resizeImageUrl from 'lib/resize-image-url';

class PodcastCoverImage extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		coverImageUrl: PropTypes.string,
		size: PropTypes.number,
		isTransientImage: PropTypes.bool,
	};

	static defaultProps = {
		size: 32,
	};

	render() {
		const { siteId, coverImageUrl, size, isTransientIcon } = this.props;
		const imageSrc = resizeImageUrl( coverImageUrl, size );

		const classes = classNames( 'podcast-cover-image', {
			'is-blank': ! imageSrc,
			'is-transient': isTransientIcon,
		} );

		const style = {
			height: size,
			width: size,
		};

		return (
			<div className={ classes } style={ style }>
				{ siteId > 0 && <QuerySites siteId={ siteId } /> }
				{ imageSrc ? (
					<Image className="podcast-cover-image__img" src={ imageSrc } alt="" />
				) : (
					<Gridicon icon="globe" size={ Math.round( size / 1.3 ) } />
				) }
				{ isTransientIcon && <Spinner /> }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const imageId = getPodcastingCoverImageId( state, siteId );

	return {
		siteId,
		coverImageUrl: getPodcastingCoverImageUrl( state, siteId ),
		isTransientImage: isTransientMedia( state, siteId, imageId ),
	};
} )( PodcastCoverImage );
