import { SegmentedControl } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { PlanTypeSelectorProps } from '../types';
import generatePath from '../utils';

type CustomerTypeProps = Pick< PlanTypeSelectorProps, 'customerType' | 'isInSignup' | 'title' >;

/**
 * Not sure where this is exactly used
 * First brought to a standalone component in: https://github.com/Automattic/wp-calypso/pull/46466
 * First introduction in https://github.com/Automattic/wp-calypso/pull/27125
 *
 * Probably can be removed.
 */
export const CustomerTypeToggle: React.FunctionComponent< CustomerTypeProps > = ( props ) => {
	const translate = useTranslate();
	const { customerType, title } = props;
	const segmentClasses = classNames(
		'plan-type-selector__interval-type',
		'is-customer-type-toggle'
	);

	return (
		<>
			{ title && <div className="plan-type-selector__title">{ title }</div> }
			<SegmentedControl className={ segmentClasses } primary={ true }>
				<SegmentedControl.Item
					selected={ customerType === 'personal' }
					path={ generatePath( props, { customerType: 'personal' } ) }
				>
					{ translate( 'Blogs and personal sites' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ customerType === 'business' }
					path={ generatePath( props, { customerType: 'business' } ) }
				>
					{ translate( 'Business sites and online stores' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</>
	);
};
