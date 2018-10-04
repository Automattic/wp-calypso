/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ControlItem from 'components/segmented-control/item';
import FormLabel from 'components/forms/form-label';
import SegmentedControl from 'components/segmented-control';

class TestLiveToggle extends Component {
	static propTypes = {
		isTestMode: PropTypes.bool.isRequired,
		onSelectLive: PropTypes.func.isRequired,
		onSelectTest: PropTypes.func.isRequired,
	};

	render = () => {
		const { isTestMode, onSelectLive, onSelectTest, translate } = this.props;

		return (
			<div className="test-live-toggle__container">
				<FormLabel>{ translate( 'Payment Mode' ) }</FormLabel>
				<SegmentedControl primary>
					<ControlItem selected={ isTestMode } onClick={ onSelectTest }>
						{ translate( 'Test Mode' ) }
					</ControlItem>
					<ControlItem selected={ ! isTestMode } onClick={ onSelectLive }>
						{ translate( 'Live Mode' ) }
					</ControlItem>
				</SegmentedControl>
			</div>
		);
	};
}

export default localize( TestLiveToggle );
