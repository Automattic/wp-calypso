import { SelectDropdown, Gridicon, Badge } from '@automattic/components';
import {
	Button,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { navigate } from 'calypso/lib/navigate';
import { LogType } from 'calypso/sites/tools/logs';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useCurrentSiteGmtOffset } from '../../hooks/use-current-site-gmt-offset';
import { DateTimePicker } from './date-time-picker';
import type { Moment } from 'moment';

import './style.scss';

type Props = {
	onDateTimeChange: ( startDateTime: Moment, endDateTime: Moment ) => void;
	onSeverityChange: ( severity: string ) => void;
	onRequestTypeChange: ( requestType: string ) => void;
	onRequestStatusChange: ( requestStatus: string ) => void;
	onAutoRefreshChange: ( isChecked: boolean ) => void;
	autoRefresh: boolean;
	logType: LogType;
	startDateTime: Moment;
	endDateTime: Moment;
	severity: string;
	requestType: string;
	requestStatus: string;
};

export const SiteLogsToolbar = ( {
	onDateTimeChange,
	onSeverityChange,
	onRequestTypeChange,
	onRequestStatusChange,
	autoRefresh,
	onAutoRefreshChange,
	logType,
	startDateTime,
	endDateTime,
	severity,
	requestType,
	requestStatus,
}: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const siteGmtOffset = useCurrentSiteGmtOffset();

	const [ isMobileOpen, setIsMobileOpen ] = useState( false );

	const handleTimeRangeChange = ( newStart: Moment | null, newEnd: Moment | null ) => {
		if (
			( ! newStart && ! newEnd ) ||
			( startDateTime.isSame( newStart ) && endDateTime.isSame( newEnd ) )
		) {
			return;
		}
		setIsMobileOpen( false );
		onDateTimeChange( newStart || startDateTime, newEnd || endDateTime );
	};

	const recordSeverityChange = ( severity: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_site_logs_severity_filter', {
				severity,
			} )
		);
	};

	const severities = [
		{ value: '', label: translate( 'All' ) },
		{ value: 'User', label: translate( 'User' ) },
		{ value: 'Warning', label: translate( 'Warning' ) },
		{ value: 'Deprecated', label: translate( 'Deprecated' ) },
		{ value: 'Fatal error', label: translate( 'Fatal error' ) },
	];

	const requestTypes = [
		{ value: '', label: translate( 'All' ) },
		{ value: 'GET', label: translate( 'GET' ) },
		{ value: 'HEAD', label: translate( 'HEAD' ) },
		{ value: 'POST', label: translate( 'POST' ) },
		{ value: 'PUT', label: translate( 'PUT' ) },
		{ value: 'DELETE', label: translate( 'DELETE' ) },
	];

	// Numbers don't need to be translated.
	const requestStatuses = [
		{ value: '', label: translate( 'All' ) },
		{ value: '200', label: '200' },
		{ value: '301', label: '301' },
		{ value: '302', label: '302' },
		{ value: '400', label: '400' },
		{ value: '401', label: '401' },
		{ value: '403', label: '403' },
		{ value: '404', label: '404' },
		{ value: '429', label: '429' },
		{ value: '500', label: '500' },
	];

	const selectedSeverity =
		severities.find( ( item ) => severity === item.value ) || severities[ 0 ];

	const selectedRequestType =
		requestTypes.find( ( item ) => requestType === item.value ) || requestTypes[ 0 ];

	const selectedRequestStatus =
		requestStatuses.find( ( item ) => requestStatus === item.value ) || requestStatuses[ 0 ];

	return (
		<div className="site-logs-toolbar">
			<ToggleControl
				__nextHasNoMarginBottom
				className="site-logs__auto-refresh site-logs__auto-refresh_mobile"
				label={ translate( 'Auto-refresh', { textOnly: true } ) }
				checked={ autoRefresh }
				onChange={ onAutoRefreshChange }
			/>

			<Button
				className="site-logs-toolbar__filter"
				onClick={ () => {
					setIsMobileOpen( ! isMobileOpen );
				} }
				variant="link"
			>
				{ ( severity || requestType || requestStatus ) && (
					<Badge className="site-logs-toolbar__badge" type="success" />
				) }
				<Gridicon icon="filter" />
				{ translate( 'Filter' ) }
			</Button>

			<div className={ clsx( 'site-logs-toolbar__top-row', { 'is-hidden': ! isMobileOpen } ) }>
				<label className="site-logs-toolbar__label site-logs-toolbar__label_toggle">
					<span>{ translate( 'Log type' ) }</span>
					<ToggleGroupControl
						className="site-logs-toolbar__toggle"
						hideLabelFromVision
						label=""
						onChange={ ( value ) => {
							navigate( window.location.pathname.replace( /\/[^/]+$/, '/' + value ) );
						} }
						value={ logType }
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							className="site-logs-toolbar__toggle-option"
							label={ translate( 'PHP error', {
								textOnly: true,
							} ) }
							value="php"
						/>
						<ToggleGroupControlOption
							className="site-logs-toolbar__toggle-option"
							label={ translate( 'Web server', {
								textOnly: true,
							} ) }
							value="web"
						/>
					</ToggleGroupControl>
				</label>

				<label className="site-logs-toolbar__label">
					<span>{ translate( 'From' ) }</span>
					<DateTimePicker
						className="site-logs-toolbar__datepicker"
						id="from"
						value={ startDateTime }
						onChange={ ( value ) => handleTimeRangeChange( value, null ) }
						gmtOffset={ siteGmtOffset }
						min={ moment.unix( 0 ) } // The UI goes weird when the unix timestamps go negative, so don't allow it
						max={ endDateTime }
					/>
				</label>

				<label className="site-logs-toolbar__label">
					<span>{ translate( 'To' ) }</span>
					<DateTimePicker
						className="site-logs-toolbar__datepicker"
						id="to"
						value={ endDateTime }
						onChange={ ( value ) => handleTimeRangeChange( null, value ) }
						gmtOffset={ siteGmtOffset }
						max={ moment() }
						min={ startDateTime }
					/>
				</label>

				{ logType === 'php' && (
					<label className="site-logs-toolbar__label">
						<span>{ translate( 'Severity' ) }</span>
						<SelectDropdown
							id="site-logs-severity"
							className="site-logs-toolbar__dropdown"
							selectedText={ selectedSeverity.label }
							initialSelected={ severity }
						>
							{ severities.map( ( option ) => (
								<SelectDropdown.Item
									key={ option.value }
									onClick={ () => {
										recordSeverityChange( option.value );
										onSeverityChange( option.value );
										setIsMobileOpen( false );
									} }
									ariaLabel={ option.label }
									selected={ option.value === severity }
								>
									{ option.label }
								</SelectDropdown.Item>
							) ) }
						</SelectDropdown>
					</label>
				) }

				{ logType === 'web' && (
					<>
						<label className="site-logs-toolbar__label">
							<span>{ translate( 'Request type' ) }</span>
							<SelectDropdown
								id="site-logs-request-type"
								className="site-logs-toolbar__dropdown"
								selectedText={ selectedRequestType.label }
								initialSelected={ requestType }
							>
								{ requestTypes.map( ( option ) => (
									<SelectDropdown.Item
										key={ option.value }
										onClick={ () => {
											onRequestTypeChange( option.value );
											setIsMobileOpen( false );
										} }
										ariaLabel={ option.label }
										selected={ option.value === requestType }
									>
										{ option.label }
									</SelectDropdown.Item>
								) ) }
							</SelectDropdown>
						</label>

						<label className="site-logs-toolbar__label">
							<span>{ translate( 'Status' ) }</span>
							<SelectDropdown
								id="site-logs-request-status"
								className="site-logs-toolbar__dropdown"
								selectedText={ selectedRequestStatus.label }
								initialSelected={ requestStatus }
							>
								{ requestStatuses.map( ( option ) => (
									<SelectDropdown.Item
										key={ option.value }
										onClick={ () => {
											onRequestStatusChange( option.value );
											setIsMobileOpen( false );
										} }
										ariaLabel={ option.label }
										selected={ option.value === requestStatus }
									>
										{ option.label }
									</SelectDropdown.Item>
								) ) }
							</SelectDropdown>
						</label>
					</>
				) }

				<ToggleControl
					__nextHasNoMarginBottom
					className="site-logs__auto-refresh site-logs__auto-refresh_desktop"
					label={ translate( 'Auto-refresh', { textOnly: true } ) }
					checked={ autoRefresh }
					onChange={ onAutoRefreshChange }
				/>
			</div>
		</div>
	);
};
