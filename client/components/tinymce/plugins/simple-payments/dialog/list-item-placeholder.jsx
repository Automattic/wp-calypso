/**
 * /* eslint-disable wpcalypso/jsx-classname-namespace
 *
 */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

const ProductListItemPlaceholder = ( { translate } ) => (
	<CompactCard className="editor-simple-payments-modal__list-item is-placeholder">
		<div className="editor-simple-payments-modal__list-label">
			<div>
				<span className="placeholder-text">{ translate( 'Loading payment buttons…' ) }</span>
			</div>
			<div>
				<span className="placeholder-text">{ '$1000' }</span>
			</div>
		</div>
	</CompactCard>
);

export default localize( ProductListItemPlaceholder );
