/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Interal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	onReviewCredentialsClick: () => void;
}

const Verification: FunctionComponent< Props > = ( { onReviewCredentialsClick } ) => {
	return (
		<div>
			<h4>Verification</h4>
			<Button primary onClick={ onReviewCredentialsClick }>
				Review Credentials
			</Button>
		</div>
	);
};

export default Verification;
