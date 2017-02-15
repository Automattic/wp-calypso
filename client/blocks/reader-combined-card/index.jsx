/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
// import AutoDirection from 'components/auto-direction';

const ReaderCombinedCard = ( { /* posts */ } ) => {
	return (
		<div className="reader-combined-card">
			<h1>Site name</h1>
			<p>x posts in timespan</p>
			<ul>
				<li>post</li>
				<li>post</li>
				<li>post</li>
			</ul>
		</div>
	);
};

ReaderCombinedCard.propTypes = {
	posts: React.PropTypes.array.isRequired
};

export default ReaderCombinedCard;
