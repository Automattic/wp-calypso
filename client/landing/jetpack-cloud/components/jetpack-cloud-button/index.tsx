/**
 * External dependencies
 */
import React, { FunctionComponent, MouseEventHandler } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

// copied from packages/components/src/button/index.jsx, stops ts complaining
interface Props {
	primary?: boolean;
	compact?: boolean;
	target?: string;
	rel?: string;
	href?: string;
	busy?: boolean;
	onClick?: MouseEventHandler< Button >;
	disabled?: boolean;
}

const JetpackCloudButton: FunctionComponent< Props > = props => {
	return <Button borderless className="jetpack-cloud-button" { ...props } />;
};

export default JetpackCloudButton;
