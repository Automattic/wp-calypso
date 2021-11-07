import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import ConnectDomainStepClipboardButton from './connect-domain-step-clipboard-button';
import ConnectDomainStepVerificationNotice from './connect-domain-step-verification-error-notice';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug, stepsHeading } from './constants';

import './style.scss';

export default function ConnectDomainStepAdvancedRecords( {
	className,
	pageSlug,
	domain,
	domainSetupInfo,
	mode,
	onVerifyConnection,
	progressStepList,
	showErrors,
	verificationInProgress,
	verificationStatus,
} ) {
	const { __ } = useI18n();
	const { data } = domainSetupInfo;
	const { default_ip_addresses: ipAddresses } = data;
	const recordLabels = {
		type: __( 'Type' ),
		name: __( 'Name' ),
		value: __( 'Value' ),
	};
	const aRecords = ipAddresses.map( ( ipAddress ) => {
		return {
			type: 'A',
			name: domain,
			value: ipAddress,
		};
	} );
	const cnameRecords = [
		{
			type: 'CNAME',
			name: 'www',
			value: domain,
		},
	];

	const itemClasses = {
		type: [ className + '__records-list-record-item', 'type' ],
		name: [ className + '__records-list-record-item', 'name' ],
		value: [ className + '__records-list-record-item', 'value' ],
	};

	const itemClassNames = {
		type: classNames( itemClasses.type ),
		name: classNames( itemClasses.name ),
		value: classNames( itemClasses.value ),
	};

	const recordsListHeader = (
		<div className={ className + '__records-list-header' }>
			{ Object.entries( recordLabels ).map( ( [ key, value ] ) => (
				<div
					key={ key }
					className={ classNames(
						className + '__records-list-record-label',
						...itemClasses[ key ]
					) }
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
				{ __( 'Find the root A records on your domain’s settings page.' ) }
				<br />
				{ __( 'Replace IP addresses (A records) of your domain to use the following values:' ) }
			</p>
			{ renderRecordsList( aRecords ) }
			<p className={ className + '__text' }>
				{ __( 'Next find the CNAME records on your domain’s settings page.' ) }
				<br />
				{ __( 'Replace the "www" CNAME record of your domain to use the following values:' ) }
			</p>
			{ renderRecordsList( cnameRecords ) }
			<p className={ className + '__text' }>
				{ __( 'Once you\'ve updated the name servers click on "Verify Connection" below.' ) }
			</p>
			<div className={ className + '__actions' }>
				<Button
					busy={ verificationInProgress }
					disabled={ verificationInProgress }
					onClick={ onVerifyConnection }
					primary
				>
					{ __( 'Verify Connection' ) }
				</Button>
			</div>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeading.ADVANCED }
			pageSlug={ pageSlug }
			progressStepList={ progressStepList }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepAdvancedRecords.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	domain: PropTypes.string.isRequired,
	domainSetupInfo: PropTypes.object.isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onVerifyConnection: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
	showErrors: PropTypes.bool.isRequired,
	verificationInProgress: PropTypes.bool,
	verificationStatus: PropTypes.object.isRequired,
};
