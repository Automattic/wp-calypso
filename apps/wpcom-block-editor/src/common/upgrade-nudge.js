/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

import './style.scss';

class UpgradeNudge extends React.Component {
	render() {
		const { translate } = this.props;
		return (
			<div className="upgrade-nudge" href="/plans?customerType=business">
				<Gridicon className="upgrade-nudge__icon" icon="star" size={ 18 } />
				<div className="upgrade-nudge__info">
					<span className="upgrade-nudge__title">{ translate( 'Upgrade to Premium' ) }</span>
					<span className="upgrade-nudge__message">
						{ translate( 'To gain access to this block.' ) }
					</span>
				</div>
				<button className="upgrade-nudge__button">{ translate( 'Upgrade' ) }</button>
			</div>
		);
	}
}

export default localize( UpgradeNudge );
