/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export class PlanSetupHeader extends Component {
	static propTypes = {};

	render() {
		const {} = this.props;
		return <Card>Yay!</Card>;
	}
}

export default localize( PlanSetupHeader );
