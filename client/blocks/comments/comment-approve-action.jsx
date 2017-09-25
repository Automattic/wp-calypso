/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

const CommentApproveAction = ( { translate, status, approveComment, unapproveComment } ) => {
	const isApproved = status === 'approved';
	const buttonStyle = classnames( 'comments__comment-actions-approve', {
		'is-approved': isApproved,
	} );

	return (
		<button className={ buttonStyle } onClick={ ! isApproved ? approveComment : unapproveComment }>
			<Gridicon icon="checkmark" size={ 18 } />
			<span className="comments__comment-actions-like-label">
				{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }
			</span>
		</button>
	);
};

CommentApproveAction.propTypes = {
	translate: PropTypes.func.isRequired,
	approveComment: PropTypes.func,
	unapproveComment: PropTypes.func,
	status: PropTypes.string.isRequired,
};

CommentApproveAction.defaultProps = {
	approveComment: noop,
	unapproveComment: noop,
};

export default localize( CommentApproveAction );
