/**
 * External dependencies
 */
import React, { FC } from 'react';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

interface Props {
	content: TranslateResult;
}

const IncompatibleProductMessage: FC< Props > = ( { content } ) => {
	return (
		<>
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<div className="payment-box-multisite">
				<Gridicon icon={ 'notice' } size={ 18 } />
				<p>{ content }</p>
			</div>
		</>
	);
};

export default IncompatibleProductMessage;
