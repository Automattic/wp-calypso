/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FollowButton from 'components/follow-button/button';
import QueryReaderTagImages from 'components/data/query-reader-tag-images';
import { getFirstImageForTag } from 'state/reader/tags/images/selectors';
import resizeImageUrl from 'lib/resize-image-url';
import cssSafeUrl from 'lib/css-safe-url';
import { decodeEntities } from 'lib/formatting';

const TAG_HEADER_WIDTH = 830;

const TagStreamHeader = ( { tag, tagImage, isPlaceholder, showFollow, following, onFollowToggle, translate } ) => {
	const classes = classnames( {
		'tag-stream__header': true,
		'is-placeholder': isPlaceholder
	} );
	const imageStyle = {};

	if ( tagImage ) {
		const imageUrl = resizeImageUrl( tagImage.url, { w: TAG_HEADER_WIDTH } );
		const safeCssUrl = cssSafeUrl( imageUrl );
		imageStyle.backgroundImage = 'url(//' + safeCssUrl + ')';
	}

	return (
		<div className={ classes }>
			<QueryReaderTagImages tag={ tag } />
			{ showFollow &&
				<div className="tag-stream__header-follow">
					<FollowButton
						followLabel={ translate( 'Follow Tag' ) }
						iconSize={ 24 }
						following={ following }
						onFollowToggle={ onFollowToggle } />
				</div>
			}

			<div className="tag-stream__header-image" style={ imageStyle }>
				<h1 className="tag-stream__header-image-title">{ tag }</h1>
				{ tagImage &&
					<div className="tag-stream__header-image-byline">
						<span className="tag-stream__header-image-byline-label">{ translate( 'Photo by' ) }</span> <a href={ tagImage.blog_url } className="tag-stream__header-image-byline-link" rel="author external">{ decodeEntities( tagImage.author ) }</a>, <a href={ tagImage.blog_url } className="tag-stream__header-image-byline-link" rel="external">{ decodeEntities( tagImage.blog_title ) }</a>
					</div>
				}
			</div>
		</div>
	);
};

TagStreamHeader.propTypes = {
	isPlaceholder: React.PropTypes.bool,
	tag: React.PropTypes.string,
	showFollow: React.PropTypes.bool,
	following: React.PropTypes.bool,
	onFollowToggle: React.PropTypes.func
};

export default connect(
	( state, ownProps ) => {
		return {
			tagImage: getFirstImageForTag( state, ownProps.tag )
		};
	}
)( localize( TagStreamHeader ) );
