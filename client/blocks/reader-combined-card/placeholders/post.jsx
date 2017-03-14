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
				<div className="reader-excerpt is-placeholder"></div>
				<div className="reader-combined-card__post-author-and-time is-placeholder">
					<div className="reader-combined-card__visit-link-placeholder"></div>
					<div className="reader-combined-card__timestamp"></div>
				</div>
			</div>
		</li>
	);
};

export default ReaderCombinedCardPostPlaceholder;
