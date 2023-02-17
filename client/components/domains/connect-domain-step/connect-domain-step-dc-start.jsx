import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import CardHeading from 'calypso/components/card-heading';
import MaterialIcon from 'calypso/components/material-icon';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug, stepsHeading } from './constants';

import './style.scss';

export default function ConnectDomainStepDCStart( {
	className,
	domain,
	domainSetupInfo,
	pageSlug,
	mode,
	progressStepList,
} ) {
	const domainConnectURL = domainSetupInfo?.data?.domain_connect_apply_wpcom_hosting;
	const { __ } = useI18n();

	const stepContent = (
		<>
			<div className={ className + '__suggested-start' }>
				<p className={ className + '__text' }>
					{ sprintf(
						// translators: %s is the domain name
						__(
							'Good news! Your DNS provider for %s supports Domain Connect - that is a user friendly way to point your domain to an external service. To finish connecting your domain to WordPress.com just click on the button below and follow the instructions on your DNS provider site.'
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
				<Button primary href={ domainConnectURL }>
					{ __( 'Start setup' ) }
				</Button>
				<p className={ className + '__text' }>{ __( 'Opens your DNS provider site' ) }</p>
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
