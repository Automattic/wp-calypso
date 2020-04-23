/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, ChangeEvent, useEffect, useState, RefObject } from 'react';
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
	activityCounts: ActivityCount[];
	context: RefObject< Button >;
	groups: string[];
	isVisible: boolean;
	onClose: () => void;
	onGroupsChange: ( newGroups: string[] ) => void;
}

const ActivityTypeSelector: FunctionComponent< Props > = ( {
	activityCounts,
	context,
	groups,
	isVisible,
	onClose,
	onGroupsChange,
} ) => {
	const translate = useTranslate();

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
		setLocalGroups( groups );
	};

	const hasChanges = ! isEqual( groups, localGroups );

	// whenever we get a new controlled value or we are hidden/visible that is the new standard
	useEffect( () => {
		setLocalGroups( groups );
	}, [ groups, isVisible ] );

	return (
		<Popover
			className="activity-type-selector__popover"
			context={ context.current }
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
				{ hasChanges ? (
					<Button
						borderless
						className="activity-type-selector__popover-buttons-selection-button"
						compact
						onClick={ clearSelection }
					>
						{ translate( '{{icon/}} Clear', {
							components: { icon: <Gridicon icon="cross" size={ 18 } /> },
						} ) }
					</Button>
				) : (
					<Button
						borderless
						className="activity-type-selector__popover-buttons-selection-button"
						compact
						onClick={ selectAll }
					>
						{ translate( '{{icon/}} Select all', {
							components: { icon: <Gridicon icon="checkmark" size={ 18 } /> },
						} ) }
					</Button>
				) }
				<Button primary compact disabled={ ! hasChanges } onClick={ handleApply }>
					{ translate( 'Apply' ) }
				</Button>
			</div>
		</Popover>
	);
};

export default ActivityTypeSelector;
