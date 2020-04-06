/**
 * External dependencies
 */
import React, { ChangeEvent, FunctionComponent, useState, useRef } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ActivityTypeCount } from './types';
import { Button } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';

interface Props {
	activityTypeCounts: ActivityTypeCount[];
	hiddenActivities: string[];
	setHiddenActivities: ( hiddenActivityKeys: string[] ) => void;
}

const BackupsActivityTypeSelector: FunctionComponent< Props > = ( {
	activityTypeCounts,
	hiddenActivities,
	setHiddenActivities,
} ) => {
	const translate = useTranslate();

	const [ showSelector, setShowSelector ] = useState( false );
	const buttonRef = useRef( null );

	const togglePopover = () => setShowSelector( ! showSelector );

	const onChange = ( { target: { name, checked } }: ChangeEvent< HTMLInputElement > ) => {
		setHiddenActivities(
			checked ? hiddenActivities.filter( key => key !== name ) : hiddenActivities.concat( name )
		);
	};

	return (
		<>
			<Button ref={ buttonRef } onClick={ togglePopover }>
				{ translate( 'Activity type' ) }
			</Button>
			<Popover
				context={ buttonRef.current }
				isVisible={ showSelector }
				onClose={ () => setShowSelector( false ) }
				position="bottom"
			>
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
