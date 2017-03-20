/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

const CommentApproveAction = ( { translate, status, approveComment, unapproveComment } ) => {
	const isApproved = status === 'approved';
	const buttonStyle = classnames( 'comments__comment-actions-approve', {
		'is-approved': isApproved
	} );

	return (
		<button className={ buttonStyle } onClick={ ! isApproved ? approveComment : unapproveComment }>
			<Gridicon icon="checkmark" size={ 18 } />
			<span className="comments__comment-actions-like-label">{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }</span>
		</button>
	);
};

CommentApproveAction.propTypes = {
	translate: React.PropTypes.func.isRequired,
	approveComment: React.PropTypes.func,
	unapproveComment: React.PropTypes.func,
	status: React.PropTypes.string.isRequired,
};

CommentApproveAction.defaultProps = {
	approveComment: noop,
	unapproveComment: noop
};

export default localize( CommentApproveAction );
