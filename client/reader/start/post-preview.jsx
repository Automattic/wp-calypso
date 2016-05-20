// External dependencies
import React from 'react';

// Internal dependencies
import Gravatar from 'components/gravatar';

const StartPostPreview = React.createClass( {
	render() {
		const user = { avatar_URL: 'https://2.gravatar.com/avatar/5512fbf07ae3dd340fb6ed4924861c8e?s=400&d=mm' };
		return (
			<article className="reader-start-post-preview">
				<h1>The Joys of Solo Camping</h1>
				<div className="reader-start-post-preview__byline">
					<Gravatar user={ user } size={ 20 } />
					<span className="reader-start-post-preview__author">by Casey Schreiner</span>
				</div>
				<p>Camping is one of the best way to truly enjoy some time in nature, but sometimes organizing a group camping trip is not the easiest thing in the world. It requires your...</p>
			</article>
		);
	}
} );

export default StartPostPreview;
