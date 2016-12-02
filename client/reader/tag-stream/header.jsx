/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { sample } from 'lodash';

/**
 * Internal dependencies
 */
import FollowButton from 'components/follow-button/button';
import QueryReaderTagImages from 'components/data/query-reader-tag-images';
import { getTagImages } from 'state/reader/tags/images/selectors';
import resizeImageUrl from 'lib/resize-image-url';
import cssSafeUrl from 'lib/css-safe-url';
import { decodeEntities } from 'lib/formatting';
import Gridicon from 'components/gridicon';

const TAG_HEADER_WIDTH = 830;
const TAG_HEADER_HEIGHT = 140;

class TagStreamHeader extends React.Component {

	static propTypes = {
		isPlaceholder: React.PropTypes.bool,
		tag: React.PropTypes.string,
		showFollow: React.PropTypes.bool,
		following: React.PropTypes.bool,
		onFollowToggle: React.PropTypes.func,
		tagImages: React.PropTypes.array,
		hasBackButton: React.PropTypes.bool
	};

	static defaultProps = {
		tagImages: []
	}

	pickTagImage = ( props = this.props ) => {
		return sample( props.tagImages );
	}

	state = {
		tag: this.props.tag,
		tagImages: this.props.tagImages,
		chosenTagImage: this.pickTagImage()
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.tagImages !== this.props.tagImages ) {
			this.setState( { chosenTagImage: this.pickTagImage( nextProps ) } );
		}
	}

	render() {
		const { tag, isPlaceholder, showFollow, following, onFollowToggle, translate, hasBackButton } = this.props;
		const classes = classnames( {
			'tag-stream__header': true,
			'is-placeholder': isPlaceholder,
			'has-back-button': hasBackButton
		} );
		const imageStyle = {};
		const tagImage = this.state.chosenTagImage;

		if ( tagImage ) {
			const imageUrl = resizeImageUrl( 'https://' + tagImage.url, { resize: `${ TAG_HEADER_WIDTH },${ TAG_HEADER_HEIGHT }` } );
			const safeCssUrl = cssSafeUrl( imageUrl );
			imageStyle.backgroundImage = 'url(' + safeCssUrl + ')';
		}

		return (
			<div className={ classes }>
				<QueryReaderTagImages tag={ tag } />
				{ showFollow &&
					<div className="tag-stream__header-follow">
						<FollowButton
							followLabel={ translate( 'Follow Tag' ) }
							followingLabel={ translate( 'Following Tag' ) }
							iconSize={ 24 }
							following={ following }
							onFollowToggle={ onFollowToggle } />
					</div>
				}

				<div className="tag-stream__header-image" style={ imageStyle }>
					<h1 className="tag-stream__header-image-title">
						<Gridicon icon="tag" size={ 24 } />{ tag }
					</h1>
					{ tagImage &&
						<div className="tag-stream__header-image-byline">
							<span className="tag-stream__header-image-byline-label">{ translate( 'Photo by ' ) }</span>
							<a href={ `/read/blogs/${ tagImage.blog_id }/posts/${ tagImage.post_id }` } className="tag-stream__header-image-byline-link" rel="author external">
								{ decodeEntities( tagImage.author ) }
							</a>
						</div>
					}
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			tagImages: getTagImages( state, ownProps.tag )
		};
	}
)( localize( TagStreamHeader ) );
