/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FollowButton from 'components/follow-button/button';
import HeaderBack from 'reader/header-back';

const TagStreamHeader = ( { isPlaceholder, title, showFollow, following, onFollowToggle } ) => {
	const classes = classnames( {
		'tag-stream__header': true,
		'is-placeholder': isPlaceholder
	} );

	return (
		<div className={ classes }>
			<HeaderBack />
			{ showFollow &&
				<div className="tag-stream__header-follow">
					<FollowButton iconSize={ 24 } following={ following } onFollowToggle={ onFollowToggle } />
			</div> }

			<Card className="tag-stream__header-image">
				<h1>{ title }</h1>
			</Card>
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
