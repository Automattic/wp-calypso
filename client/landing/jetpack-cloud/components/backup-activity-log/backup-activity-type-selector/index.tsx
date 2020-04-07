/**
 * External dependencies
 */
import React, { ChangeEvent, FunctionComponent, useRef } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ActivityTypeCount } from '../types';
import { Button } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';

interface Props {
	activityTypeCounts: ActivityTypeCount[];
	hiddenActivities: string[];
	onClick: () => void;
	setHiddenActivities: ( hiddenActivityKeys: string[] ) => void;
	visible: boolean;
}

const BackupsActivityTypeSelector: FunctionComponent< Props > = ( {
	activityTypeCounts,
	hiddenActivities,
	onClick,
	setHiddenActivities,
	visible,
} ) => {
	const translate = useTranslate();

	const buttonRef = useRef( null );

	const onChange = ( { target: { name, checked } }: ChangeEvent< HTMLInputElement > ) => {
		setHiddenActivities(
			checked ? hiddenActivities.filter( key => key !== name ) : hiddenActivities.concat( name )
		);
	};

	return (
		<>
			<Button className="backup-activity-type-selector" ref={ buttonRef } onClick={ onClick }>
				{ translate( 'Activity type' ) }
			</Button>
			<Popover context={ buttonRef.current } isVisible={ visible } position="bottom">
				{ activityTypeCounts.map( ( { key, name, count } ) => (
					<FormLabel key={ key } optional={ false } required={ false }>
						<FormCheckbox
							checked={ ! hiddenActivities.includes( key ) }
							name={ key }
							onChange={ onChange }
						/>
						<span>{ `${ name } (${ count })` }</span>
					</FormLabel>
				) ) }
			</Popover>
		</>
	);
};

export default BackupsActivityTypeSelector;
