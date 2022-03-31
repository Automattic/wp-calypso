import { ScreenReaderText, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { reject } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { withSelectedItems } from 'calypso/my-sites/media/context';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class RemoveButton extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		itemId: PropTypes.number,
	};

	remove = () => {
		const { siteId, itemId, selectedItems } = this.props;
		if ( ! siteId || ! itemId ) {
			return;
		}

		const items = reject( selectedItems, ( item ) => item.ID === itemId );

		this.props.selectMediaItems( items );
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

export default localize( withSelectedItems( RemoveButton ) );
