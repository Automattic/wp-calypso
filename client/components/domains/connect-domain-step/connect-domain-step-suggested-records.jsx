import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import ConnectDomainStepClipboardButton from './connect-domain-step-clipboard-button';
import ConnectDomainStepVerificationNotice from './connect-domain-step-verification-error-notice';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug, stepsHeading } from './constants';

import './style.scss';

export default function ConnectDomainStepSuggestedRecords( {
	className,
	pageSlug,
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
	const { wpcom_name_servers: nameServers } = data;

	const stepContent = (
		<div className={ className + '__suggested-records' }>
			{ showErrors && (
				<ConnectDomainStepVerificationNotice
					mode={ mode }
					verificationStatus={ verificationStatus }
				/>
			) }
			<p className={ className + '__text' }>
				{ __( 'Find the name servers on your domain’s settings page.' ) }
				<br />
				{ __( 'Replace all the name servers of your domain to use the following values:' ) }
			</p>
			<div className={ className + '__records-list' }>
				{ nameServers.map( ( nameServer ) => {
					return (
						<div key={ nameServer } className={ className + '__records-list-record' }>
							<div className={ className + '__records-list-record-item' }>
								<ConnectDomainStepClipboardButton baseClassName={ className } text={ nameServer } />
							</div>
						</div>
					);
				} ) }
			</div>
			<p className={ className + '__text' }>
				{ __( 'Once you\'ve updated the name servers click on "Verify Connection" below.' ) }
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

ConnectDomainStepSuggestedRecords.propTypes = {
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
