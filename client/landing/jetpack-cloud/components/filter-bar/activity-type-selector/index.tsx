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
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

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
	const buttonRef = useRef< Button >();

	const [ localGroups, setLocalGroups ] = useState( groups );

	const handleChange = ( { target: { checked, name } }: ChangeEvent< HTMLInputElement > ) => {
		setLocalGroups(
			( checked ? [ ...localGroups, name ] : localGroups.filter( ( key ) => key !== name ) ).filter(
				( value, index, self ) => self.indexOf( value ) === index
			)
		);
	};

	const handleApply = () => {
		onGroupsChange( localGroups );
		onClose();
	};

	const selectAll = () => {
		setLocalGroups( activityCounts.map( ( { key } ) => key ) );
	};

	const clearSelection = () => {
		setLocalGroups( [] );
	};

	const hasChanges = ! isEqual( groups, localGroups );

	const hasAllSelected = localGroups.length === activityCounts.length;

	// whenever we get a new controlled value or we are hidden/visible that is the new standard
	useEffect( () => {
		setLocalGroups( groups );
	}, [ groups, isVisible ] );

	return (
		<div className="activity-type-selector">
			<Button
				className={
					isVisible
						? 'activity-type-selector__main-button-active'
						: 'activity-type-selector__main-button'
				}
				compact
				onClick={ onClick }
				ref={ buttonRef }
			>
				{ translate( 'Activity type' ) }
			</Button>
			<Popover
				className="activity-type-selector__popover"
				context={ buttonRef.current }
				isVisible={ isVisible }
				onClose={ onClose }
				position="bottom"
			>
				{ activityCounts.map( ( { name, key, count } ) => (
					<FormLabel
						className="activity-type-selector__popover-label"
						key={ key }
						optional={ false }
						required={ false }
					>
						<FormCheckbox
							className="activity-type-selector__popover-check-box"
							name={ key }
							checked={ localGroups.includes( key ) }
							onChange={ handleChange }
						/>
						<span className="activity-type-selector__popover-label-text">{ `${ name } (${ count })` }</span>
					</FormLabel>
				) ) }
				<div className="activity-type-selector__popover-buttons">
					{ hasAllSelected ? (
						<Button
							borderless
							className="activity-type-selector__popover-buttons-selection-button"
							compact
							onClick={ clearSelection }
						>
							<Gridicon icon="cross" size={ 18 } />
							{ translate( 'Clear all' ) }
						</Button>
					) : (
						<Button
							borderless
							className="activity-type-selector__popover-buttons-selection-button"
							compact
							onClick={ selectAll }
						>
							<Gridicon icon="checkmark" size={ 18 } />
							{ translate( 'Select all' ) }
						</Button>
					) }
					<Button primary compact disabled={ ! hasChanges } onClick={ handleApply }>
						{ translate( 'Apply' ) }
					</Button>
				</div>
			</Popover>
		</div>
	);
};

export default ActivityTypeSelector;
