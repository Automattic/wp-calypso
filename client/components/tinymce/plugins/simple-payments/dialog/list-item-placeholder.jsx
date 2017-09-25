/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

const ProductListItemPlaceholder = ( { translate } ) =>
	<CompactCard className="editor-simple-payments-modal__list-item is-placeholder">
		<div className="editor-simple-payments-modal__list-label">
			<div>
				<span className="placeholder-text">
					{ translate( 'Loading payment buttons…' ) }
				</span>
			</div>
			<div>
				<span className="placeholder-text">
					{ '$1000' }
				</span>
			</div>
		</div>
	</CompactCard>;

export default localize( ProductListItemPlaceholder );
