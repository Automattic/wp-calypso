/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Style dependencies
 */
import './comment-approve-action.scss';

const CommentApproveAction = ( { translate, status, approveComment, unapproveComment } ) => {
	const isApproved = status === 'approved';
	const buttonStyle = classnames( 'comments__comment-actions-approve', {
		'is-approved': isApproved,
	} );

	return (
		<Button className={ buttonStyle } onClick={ ! isApproved ? approveComment : unapproveComment }>
			<Gridicon icon="checkmark" size={ 18 } />
			<span className="comments__comment-actions-like-label">
				{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }
			</span>
		</Button>
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
