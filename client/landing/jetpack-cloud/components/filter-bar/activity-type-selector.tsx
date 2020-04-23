/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useRef, ChangeEvent, useEffect, useState } from 'react';
import { isEqual } from 'lodash';

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

	const [ localGroups, setLocalGroups ] = useState( groups );

	const onChange = ( { target: { checked, name } }: ChangeEvent< HTMLInputElement > ) => {
		setLocalGroups(
			( checked ? [ ...localGroups, name ] : localGroups.filter( ( key ) => key !== name ) ).filter(
				( value, index, self ) => self.indexOf( value ) === index
			)
		);
	};

	const onApply = () => {
		onGroupsChange( localGroups );
		onClose();
	};

	const onSelectAll = () => {
		setLocalGroups( activityCounts.map( ( { key } ) => key ) );
	};

	const hasChanges = ! isEqual( groups, localGroups );

	const hasAllSelected = localGroups.length === activityCounts.length;

	// whenever we get a new controlled value or we are hidden/visible that is the new standard
	useEffect( () => {
		setLocalGroups( groups );
	}, [ groups, isVisible ] );

	return (
		<div className="activity-type-selector">
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
						<FormCheckbox
							className="activity-type-selector__check-box"
							name={ key }
							checked={ localGroups.includes( key ) }
							onChange={ onChange }
						/>
						<span>{ `${ name } (${ count })` }</span>
					</FormLabel>
				) ) }
				<Button borderless compact disabled={ hasAllSelected } onClick={ onSelectAll }>
					{ translate( 'Select all' ) }
				</Button>
				<Button primary compact disabled={ ! hasChanges } onClick={ onApply }>
					{ translate( 'Apply' ) }
				</Button>
			</Popover>
		</div>
	);
};

export default ActivityTypeSelector;
