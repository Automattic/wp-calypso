/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { Icon, chevronDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Link, { Props as LinkProps } from '../link';
import { usePath, Step } from '../../path';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends LinkProps {
	children: string | React.ReactElement;
}

const DomainPickerButton: React.FunctionComponent< Props > = ( {
	children,
	className,
	...buttonProps
} ) => {
	const makePath = usePath();
	return (
		<>
			<Link
				{ ...buttonProps }
				to={ makePath( Step.DomainsModal ) }
				className={ classnames( 'domain-picker-button', className ) }
			>
				<span className="domain-picker-button__label">{ children }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Link>
		</>
	);
};

export default DomainPickerButton;
