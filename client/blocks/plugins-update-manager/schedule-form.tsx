import {
	TextControl,
	TimePicker,
	RadioControl,
	CheckboxControl,
	__experimentalVStack as VStack,
	Flex,
	FlexItem,
} from '@wordpress/components';
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
				gap={ 8 }
			>
				<FlexItem>
					<TextControl label="Name" value={ name } onChange={ setName } />
					<TimePicker onChange={ function noRefCheck() {} } />
					<RadioControl
						label="Frequency"
						onChange={ setFrequency }
						options={ [
							{
								label: 'Daily',
								value: 'daily',
							},
							{
								label: 'Weekly',
								value: 'weekly',
							},
						] }
						selected={ frequency }
					/>
				</FlexItem>
				<FlexItem>
					<VStack>
						<label htmlFor="select-all">Plugins</label>
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
				</FlexItem>
			</Flex>
		</form>
	);
};
