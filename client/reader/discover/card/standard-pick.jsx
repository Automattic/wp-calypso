/**
 * External dependencies
 */
import React from 'react';
import get from 'lodash/get';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
const StandardPick = ( post ) => {
	const
		headerImageUrl = get( post, 'canonical_image.uri' ),
		articleClasses = classNames( 'reader-discover-card__standard-pick', {
			'has-image': !! headerImageUrl
		} );

	// Resize image with Photon
	let heroStyle;
	if ( headerImageUrl ) {
		heroStyle = {
			backgroundImage: `url("${ headerImageUrl }")`
		};
	}

	return (
		<article className={ articleClasses }>
			<div className="reader-discover-card__featured-image " style={ heroStyle }></div>
			<div className="reader-discover-card__post-content">
				<h1>
					<a href="/">{ post.title }</a>
				</h1>
				<p>{ post.excerpt }</p>
			</div>
		</article>
	);
};

StandardPick.propTypes = {
	post: React.PropTypes.object.required
};

export default StandardPick;
