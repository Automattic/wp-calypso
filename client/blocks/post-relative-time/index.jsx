/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { getNormalizedPost } from 'state/posts/selectors';

function PostRelativeTime( { moment, post } ) {
	let time;
	if ( post ) {
		const { status, modified, date } = post;
		time = includes( [ 'draft', 'pending' ], status ) ? modified : date;
	}

	const classes = classNames( 'post-relative-time', {
		'is-placeholder': ! post
	} );

	return (
		<span className={ classes }>
			<Gridicon
				icon="time"
				size={ 18 }
				className="post-relative-time__icon" />
			<span className="post-relative-time__text">
				{ moment( time ).fromNow() }
			</span>
		</span>
	);
}

PostRelativeTime.propTypes = {
	globalId: PropTypes.string,
	moment: PropTypes.func,
	post: PropTypes.object
};

export default connect( ( state, { globalId } ) => {
	return {
		post: getNormalizedPost( state, globalId )
	};
} )( localize( PostRelativeTime ) );
