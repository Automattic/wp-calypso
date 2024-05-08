import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import ConnectDomainStepClipboardButton from './connect-domain-step-clipboard-button';
import ConnectDomainStepVerificationNotice from './connect-domain-step-verification-error-notice';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug, stepsHeading } from './constants';

import './style.scss';

export default function ConnectSubdomainStepSuggestedRecords( {
	className,
	domain,
	domainSetupInfo,
	pageSlug,
	mode,
	onVerifyConnection,
	progressStepList,
	showErrors,
	verificationInProgress,
	verificationStatus,
} ) {
	const { __ } = useI18n();

	const { data } = domainSetupInfo;
	const { wpcom_name_servers: nameServers } = data;

	const recordLabels = {
		type: __( 'Type' ),
		name: __( 'Name' ),
		value: __( 'Value' ),
	};
	const nsRecords = nameServers.map( ( nameServer ) => {
		return {
			type: 'NS',
			name: domain,
			value: nameServer,
		};
	} );

	const itemClasses = {
		type: [ className + '__records-list-record-item', 'type' ],
		name: [ className + '__records-list-record-item', 'name' ],
		value: [ className + '__records-list-record-item', 'value' ],
	};

	const itemClassNames = {
		type: clsx( itemClasses.type ),
		name: clsx( itemClasses.name ),
		value: clsx( itemClasses.value ),
	};

	const recordsListHeader = (
		<div className={ className + '__records-list-header' }>
			{ Object.entries( recordLabels ).map( ( [ key, value ] ) => (
				<div
					key={ key }
					className={ clsx( className + '__records-list-record-label', ...itemClasses[ key ] ) }
				>
					{ value }
				</div>
			) ) }
		</div>
	);

	const renderRecordsListItems = ( recordsList ) => {
		return recordsList.map( ( record, index ) => {
			return (
				<div key={ 'record-' + index } className={ className + '__records-list-record' }>
					{ Object.entries( record ).map( ( [ key, value ] ) => {
						if ( 'type' === key ) {
							return (
								<div key={ 'record-item' + key + '-' + index } className={ itemClassNames.type }>
									<div className={ className + '__records-list-record-label' }>
										{ recordLabels.type }
									</div>
									{ value }
								</div>
							);
						}
						return (
							<div key={ 'record-item' + key + '-' + index } className={ itemClassNames[ key ] }>
								<div className={ className + '__records-list-record-label' }>
									{ recordLabels[ key ] }
								</div>
								<ConnectDomainStepClipboardButton baseClassName={ className } text={ value } />
							</div>
						);
					} ) }
				</div>
			);
		} );
	};

	const renderRecordsList = ( recordsList ) => (
		<div className={ className + '__records-list' }>
			{ recordsListHeader }
			{ renderRecordsListItems( recordsList ) }
		</div>
	);

	const stepContent = (
		<div className={ className + '__advanced-records' }>
			{ showErrors && (
				<ConnectDomainStepVerificationNotice
					mode={ mode }
					verificationStatus={ verificationStatus }
				/>
			) }
			<p className={ className + '__text' }>
				{ __(
					"Find the NS records on your subdomain's settings page and replace them with the following values:"
				) }
			</p>
			{ renderRecordsList( nsRecords ) }
			<p className={ className + '__text' }>
				{ __( 'Once you\'ve updated the records click on "Verify Connection" below.' ) }
			</p>
			<div className={ className + '__actions' }>
				<Button
					primary
					onClick={ onVerifyConnection }
					disabled={ verificationInProgress }
					busy={ verificationInProgress }
				>
					{ __( 'Verify Connection' ) }
				</Button>
			</div>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeading.SUGGESTED }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectSubdomainStepSuggestedRecords.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	domainSetupInfo: PropTypes.object.isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onVerifyConnection: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
	showErrors: PropTypes.bool.isRequired,
	verificationInProgress: PropTypes.bool,
	verificationStatus: PropTypes.object.isRequired,
};
