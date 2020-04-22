/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useRef, ChangeEvent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';

interface ActivityCount {
	count: number;
	key: string;
	name: string;
}

interface Props {
	groups: string[];
	onGroupsChange: ( newGroups: string[] ) => void;
	isVisible: boolean;
	onClick: () => void;
	onClose: () => void;
	activityCounts: ActivityCount[];
}

const ActivityTypeSelector: FunctionComponent< Props > = ( {
	isVisible,
	onClick,
	onClose,
	activityCounts,
	groups,
	onGroupsChange,
} ) => {
	const translate = useTranslate();
	const buttonRef = useRef();

	const onChange = ( { target: { checked, name } }: ChangeEvent< HTMLInputElement > ) => {
		onGroupsChange(
			( checked ? [ ...groups, name ] : groups.filter( ( key ) => key !== name ) ).filter(
				( value, index, self ) => self.indexOf( value ) === index
			)
		);
	};

	return (
		<>
			<Button ref={ buttonRef } compact onClick={ onClick }>
				{ translate( 'Activity type' ) }
			</Button>
			<Popover
				context={ buttonRef.current }
				isVisible={ isVisible }
				onClose={ onClose }
				position="bottom"
			>
				{ activityCounts.map( ( { name, key, count } ) => (
					<FormLabel key={ key } optional={ false } required={ false }>
						<FormCheckbox name={ key } checked={ groups.includes( key ) } onChange={ onChange } />
						<span>{ `${ name } ( ${ count } )` }</span>
					</FormLabel>
				) ) }
			</Popover>
		</>
	);
};

export default ActivityTypeSelector;
