/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { getNormalizedPost } from 'calypso/state/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export function PostStatus( { translate, post, showAll, showIcon = true } ) {
	if ( ! post ) {
		return null;
	}

	const { sticky, status } = post;
	let text;
	let classModifier;
	let icon;
	if ( sticky ) {
		text = translate( 'Sticky' );
		classModifier = 'is-sticky';
		icon = 'bookmark-outline';
	} else if ( 'pending' === status ) {
		text = translate( 'Pending Review' );
		classModifier = 'is-pending';
		icon = 'aside';
	} else if ( showAll && 'future' === status ) {
		text = translate( 'Scheduled' );
		classModifier = 'is-scheduled';
		icon = 'calendar';
	} else if ( showAll && 'trash' === status ) {
		text = translate( 'Trashed' );
		classModifier = 'is-trash';
		icon = 'trash';
	} else if ( showAll && 'draft' === status ) {
		text = translate( 'Draft' );
		classModifier = 'is-draft';
		icon = 'aside';
	} else if ( showAll && 'publish' === status ) {
		text = translate( 'Published' );
		classModifier = 'is-published';
		icon = 'aside';
	}

	if ( ! text ) {
		return null;
	}

	const classes = classNames( 'post-status', classModifier );

	return (
		<span className={ classes }>
			{ showIcon && <Gridicon icon={ icon } size={ 18 } className="post-status__icon" /> }
			<span className="post-status__text">{ text }</span>
		</span>
	);
}

PostStatus.displayName = 'PostStatus';

PostStatus.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func,
	post: PropTypes.object,
	showAll: PropTypes.bool,
	showIcon: PropTypes.bool,
};

export default connect( ( state, { globalId } ) => ( {
	post: getNormalizedPost( state, globalId ),
} ) )( localize( PostStatus ) );
