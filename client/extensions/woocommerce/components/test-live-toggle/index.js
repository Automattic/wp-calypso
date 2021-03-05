/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import SegmentedControl from 'calypso/components/segmented-control';

class TestLiveToggle extends Component {
	static propTypes = {
		isTestMode: PropTypes.bool.isRequired,
		onSelectLive: PropTypes.func.isRequired,
		onSelectTest: PropTypes.func.isRequired,
	};

	render() {
		const { isTestMode, onSelectLive, onSelectTest, translate } = this.props;

		return (
			<div className="test-live-toggle__container">
				<FormLabel>{ translate( 'Payment Mode' ) }</FormLabel>
				<SegmentedControl primary>
					<SegmentedControl.Item selected={ isTestMode } onClick={ onSelectTest }>
						{ translate( 'Test Mode' ) }
					</SegmentedControl.Item>
					<SegmentedControl.Item selected={ ! isTestMode } onClick={ onSelectLive }>
						{ translate( 'Live Mode' ) }
					</SegmentedControl.Item>
				</SegmentedControl>
			</div>
		);
	}
}

export default localize( TestLiveToggle );
