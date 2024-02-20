import {
	TextControl,
	RadioControl,
	SearchControl,
	CheckboxControl,
	__experimentalVStack as VStack,
	Flex,
	FlexItem,
} from '@wordpress/components';
import classnames from 'classnames';
import { useState } from 'react';

import './schedule-form.scss';

export const ScheduleForm = () => {
	const [ name, setName ] = useState( '' );
	const [ frequency, setFrequency ] = useState( 'daily' );

	return (
		<form>
			<Flex
				className="schedule-form"
				direction={ [ 'column', 'row' ] }
				expanded={ true }
				align="start"
				gap={ 12 }
			>
				<FlexItem>
					<div className="form-field">
						<label htmlFor="name">Name</label>
						<TextControl id="name" value={ name } onChange={ setName } __next40pxDefaultSize />
					</div>
					<div className="form-field">
						<label htmlFor="frequency">Update every</label>
						<div className={ classnames( 'radio-option', { selected: frequency === 'daily' } ) }>
							<RadioControl
								name="frequency"
								onChange={ setFrequency }
								options={ [
									{
										label: 'Daily',
										value: 'daily',
									},
								] }
								selected={ frequency }
							></RadioControl>
						</div>
						<div className={ classnames( 'radio-option', { selected: frequency === 'weekly' } ) }>
							<RadioControl
								name="frequency"
								onChange={ setFrequency }
								options={ [
									{
										label: 'Weekly',
										value: 'weekly',
									},
								] }
								selected={ frequency }
							></RadioControl>
						</div>
					</div>
				</FlexItem>
				<FlexItem>
					<div className="form-field">
						<label htmlFor="select-all">Select plugins</label>
						<VStack className="checkbox-options">
							<SearchControl onChange={ function noRefCheck() {} } />
							<CheckboxControl
								id="select-all"
								__nextHasNoMarginBottom
								label="Select all"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Move to WordPress.com"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Akismet"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Advance custom fields"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Gravity forms"
								onChange={ function noRefCheck() {} }
							/>
						</VStack>
					</div>
				</FlexItem>
			</Flex>
		</form>
	);
};
