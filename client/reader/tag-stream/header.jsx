/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FollowButton from 'components/follow-button/button';

const TagStreamHeader = ( { isPlaceholder, title, showFollow, following, onFollowToggle, translate } ) => {
	const classes = classnames( {
		'tag-stream__header': true,
		'is-placeholder': isPlaceholder
	} );

	// @todo hardcoded until we can pull images from Redux
	const tagImage = {
		url: 'marichulambino.files.wordpress.com/2008/05/bigyellow4.jpg',
		blog_title: 'marichu lambino . Content   &amp; design updated daily',
		author: 'marichulambino',
		blog_url: 'http://marichulambino.wordpress.com'
	};

	return (
		<div className={ classes }>
			{ showFollow &&
				<div className="tag-stream__header-follow">
					<FollowButton
						followLabel={ translate( 'Follow Tag' ) }
						iconSize={ 24 }
						following={ following }
						onFollowToggle={ onFollowToggle } />
				</div>
			}

			<div className="tag-stream__header-image">
				<h1 className="tag-stream__header-image-title">{ title }</h1>
				{ tagImage &&
					<div className="tag-stream__header-image-byline">
						{ translate( 'Photo by' ) }&nbsp;
						<a href={ tagImage.blog_url } rel="author external">{ tagImage.author }</a>,
						<a href={ tagImage.blog_url } rel="external">{ tagImage.blog_title }</a>
					</div>
				}
			</div>
		</div>
	);
};

TagStreamHeader.propTypes = {
	isPlaceholder: React.PropTypes.bool,
	title: React.PropTypes.string,
	showFollow: React.PropTypes.bool,
	following: React.PropTypes.bool,
	onFollowToggle: React.PropTypes.func
};

export default localize( TagStreamHeader );
