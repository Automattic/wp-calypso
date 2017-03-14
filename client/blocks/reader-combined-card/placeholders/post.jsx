/**
 * External dependencies
 */
import React from 'react';

const ReaderCombinedCardPostPlaceholder = () => {
	return (
		<li className="reader-combined-card__post is-placeholder">
			<div className="reader-combined-card__featured-image-wrapper"></div>
			<div className="reader-combined-card__post-details">
				<h1 className="reader-combined-card__post-title"></h1>
				<div className="reader-excerpt"></div>
				<div className="reader-combined-card__post-author-and-time is-placeholder">
					<div className="reader-visit-link"></div>
					<span className="reader-combined-card__timestamp"></span>
				</div>
			</div>
		</li>
	);
};

export default ReaderCombinedCardPostPlaceholder;
