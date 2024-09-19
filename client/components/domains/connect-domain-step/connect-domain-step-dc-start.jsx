import { Button, MaterialIcon } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import CardHeading from 'calypso/components/card-heading';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug, stepsHeading } from './constants';

import './style.scss';

export default function ConnectDomainStepDCStart( {
	className,
	domain,
	domainSetupInfo,
	pageSlug,
	mode,
	onVerifyConnection,
	progressStepList,
} ) {
	const domainConnectURL = domainSetupInfo?.data?.domain_connect_apply_wpcom_hosting;
	const { __ } = useI18n();

	const clickHandler = useCallback( () => {
		onVerifyConnection( false );
		window.location.href = domainConnectURL;
	}, [ onVerifyConnection, domainConnectURL ] );

	const stepContent = (
		<>
			<div className={ className + '__suggested-start' }>
				<p className={ className + '__text' }>
					{ sprintf(
						// translators: %s is the domain name
						__(
							'Good news! Your DNS provider for %s supports a simple click-through way to connect your domain to WordPress.com. Use the button below and follow the on-screen instructions. You might need to log in to your DNS provider account so make sure you have your credentials at hand.'
						),
						domain
					) }
				</p>
				<CardHeading className={ className + '__sub-heading' }>
					<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
					{ __( 'How long will it take?' ) }
				</CardHeading>
				<p className={ className + '__text' }>
					{ __( 'It takes 2 minutes to set up.' ) }
					<br />
					{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
				</p>
				<Button primary onClick={ clickHandler }>
					{ __( 'Start setup' ) } <MaterialIcon icon="launch" size={ 16 } />
				</Button>
			</div>
		</>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeading.ADVANCED }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepDCStart.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
	setPage: PropTypes.func.isRequired,
};
