/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import TitleStore from 'lib/screen-title/store';

const stores = [ TitleStore ];

function getStateFromStores() {
	return {
		title: TitleStore.getState().title
	};
}

class TitleData extends React.Component {
	render() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
};

export default TitleData;
