import {
	__experimentalText as Text,
	Flex,
	FlexBlock,
	FlexItem,
	RadioControl,
	SelectControl,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSiteDateTimeFormat } from './hooks/use-site-date-time-format';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleFormTime } from './schedule-form-time';
import { DAILY_OPTION, DAY_OPTIONS, DEFAULT_HOUR, WEEKLY_OPTION } from './schedule-form.const';
import { prepareTimestamp } from './schedule-form.helper';

type Frequency = 'daily' | 'weekly';
type FlexDirection = 'column' | 'row';

interface Props {
	className?: string;
	initTimestamp?: number;
	initFrequency: Frequency;
	optionsDirection?: FlexDirection[];
	error?: string;
	showError?: boolean;
	showAllOptionControls?: boolean;
	onTouch?: ( touched: boolean ) => void;
	onChange?: ( frequency: Frequency, timestamp: number ) => void;
}
export function ScheduleFormFrequency( props: Props ) {
	const siteSlug = useSiteSlug();
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const {
		className = '',
		initTimestamp,
		initFrequency = 'daily',
		optionsDirection = [ 'column' ],
		error,
		showError,
		showAllOptionControls,
		onChange,
		onTouch,
	} = props;
	const { isAmPmPhpTimeFormat } = useSiteDateTimeFormat( siteSlug );
	const isAmPmFormat = isAmPmPhpTimeFormat();

	const initDate = initTimestamp
		? moment( initTimestamp )
		: moment( new Date() ).hour( DEFAULT_HOUR );

	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >( initFrequency );
	const [ day, setDay ] = useState< string >( initDate.weekday().toString() );
	const [ hour, setHour ] = useState< string >( initDate.format( 'h' ) ); // 'h' is for 12-hour format
	const [ period, setPeriod ] = useState< string >( initDate.format( 'a' ) ); // 'a' is for am/pm

	const [ timestamp, setTimestamp ] = useState( prepareTimestamp( frequency, day, hour, period ) );
	const [ fieldTouched, setFieldTouched ] = useState( false );

	useEffect(
		() => setTimestamp( prepareTimestamp( frequency, day, hour, period ) ),
		[ frequency, day, hour, period ]
	);
	useEffect( () => onTouch?.( fieldTouched ), [ fieldTouched ] );
	useEffect( () => onChange?.( frequency, timestamp ), [ frequency, timestamp ] );

	return (
		<div className={ `form-field form-field--frequency ${ className }` }>
			<label htmlFor="frequency">{ translate( 'Update every' ) }</label>
			<Flex direction={ optionsDirection }>
				<FlexItem className={ classnames( 'radio-option', { selected: frequency === 'daily' } ) }>
					<RadioControl
						name="frequency"
						options={ [ DAILY_OPTION ] }
						selected={ frequency }
						onChange={ ( f ) => setFrequency( f as 'daily' ) }
						onBlur={ () => setFieldTouched( true ) }
					></RadioControl>
					{ ( showAllOptionControls || frequency === 'daily' ) && (
						<Flex gap={ 6 }>
							<FlexBlock>
								<ScheduleFormTime
									initHour={ hour }
									initPeriod={ period }
									isAmPmFormat={ isAmPmFormat }
									onChange={ ( hour, period ) => {
										setHour( hour );
										setPeriod( period );
									} }
								/>
							</FlexBlock>
						</Flex>
					) }
				</FlexItem>
				<FlexItem className={ classnames( 'radio-option', { selected: frequency === 'weekly' } ) }>
					<RadioControl
						name="frequency"
						options={ [ WEEKLY_OPTION ] }
						selected={ frequency }
						onChange={ ( f ) => setFrequency( f as 'weekly' ) }
						onBlur={ () => setFieldTouched( true ) }
					></RadioControl>
					{ ( showAllOptionControls || frequency === 'weekly' ) && (
						<Flex gap={ 6 } direction={ [ 'column', 'row' ] }>
							<FlexItem>
								<div className="form-field">
									<SelectControl
										__next40pxDefaultSize
										name="day"
										value={ day }
										options={ DAY_OPTIONS }
										onChange={ setDay }
									/>
								</div>
							</FlexItem>
							<FlexBlock>
								<ScheduleFormTime
									initHour={ hour }
									initPeriod={ period }
									isAmPmFormat={ isAmPmFormat }
									onChange={ ( hour, period ) => {
										setHour( hour );
										setPeriod( period );
									} }
								/>
							</FlexBlock>
						</Flex>
					) }
				</FlexItem>
			</Flex>
			{ ( ( showError && error ) || ( fieldTouched && error ) ) && (
				<Text className="validation-msg">
					<Icon className="icon-info" icon={ info } size={ 16 } />
					{ error }
				</Text>
			) }
		</div>
	);
}
