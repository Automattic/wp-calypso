/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
// import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';


const CommentApproveAction = ( { translate, status, onClick } ) => {
	const isApproved = status === 'approved';
	const buttonStyle = classnames( 'comments__comment-actions-approve', {
		'is-approved': isApproved
	} );

	return (
		<button className={ buttonStyle } onClick={ onClick }>
			<Gridicon icon="checkmark" size={ 18 }/>
			<span className="comments__comment-actions-like-label">{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }</span>
		</button>
	);
};

CommentApproveAction.propTypes = {
	translate: React.PropTypes.func.isRequired,
	onClick: React.PropTypes.func,
	status: React.PropTypes.string.isRequired,
};

CommentApproveAction.defaultProps ={
	onClick: noop,
}

export default localize( CommentApproveAction );
