/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Masterbar from './masterbar.jsx';
import Item from './item.jsx';

class MasterbarShell extends React.Component {
	render() {
		return (
			<Masterbar>
				<Item icon="my-sites">
					<span className="masterbar__item-placeholder">My Sites</span>
				</Item>
				<Item icon="reader" className="masterbar__reader">
					<span className="masterbar__item-placeholder">Reader</span>
				</Item>
				<div className="masterbar__publish">
					<Item icon="create" className="masterbar__item-new" />
				</div>
				<Item icon="user-circle" className="masterbar__item-me" />
				<Item icon="bell" className="masterbar__item-notifications" />
			</Masterbar>
		);
	}
}

export default MasterbarShell;
