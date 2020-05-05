/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { reject } from 'lodash';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { ScreenReaderText } from '@automattic/components';
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class RemoveButton extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		itemId: PropTypes.number,
	};

	remove = () => {
		const { siteId, itemId } = this.props;
		if ( ! siteId || ! itemId ) {
			return;
		}

		const selected = MediaLibrarySelectedStore.getAll( siteId );
		const items = reject( selected, ( item ) => item.ID === itemId );

		MediaActions.setLibrarySelectedItems( siteId, items );
	};

	render() {
		const { translate } = this.props;

		return (
			<button
				onClick={ this.remove }
				onMouseDown={ ( event ) => event.stopPropagation() }
				className="editor-media-modal-gallery__remove"
			>
				<ScreenReaderText>{ translate( 'Remove' ) }</ScreenReaderText>
				<Gridicon icon="cross" />
			</button>
		);
	}
}

RemoveButton.displayName = 'RemoveButton';

export default localize( RemoveButton );
