/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackCloudButton: FunctionComponent = props => {
	return <Button borderless className="jetpack-cloud-button" { ...props } />;
};

export default JetpackCloudButton;
