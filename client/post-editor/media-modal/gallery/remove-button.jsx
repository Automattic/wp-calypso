import { ScreenReaderText, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { reject } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { selectMediaItems } from 'calypso/state/media/actions';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';

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

		this.props.selectMediaItems( siteId, items );
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

export default connect(
	( state, { siteId } ) => ( {
		selectedItems: getMediaLibrarySelectedItems( state, siteId ),
	} ),
	{ selectMediaItems }
)( localize( RemoveButton ) );
