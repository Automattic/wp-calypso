import { Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import CardHeading from 'calypso/components/card-heading';
import { stepsHeadingTransfer } from 'calypso/components/domains/connect-domain-step/constants';
import { getDomainTransferrability } from 'calypso/components/domains/use-my-domain/utilities';
import MaterialIcon from 'calypso/components/material-icon';
import Notice from 'calypso/components/notice';
import { MAP_EXISTING_DOMAIN } from 'calypso/lib/url/support';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import './style.scss';
import { StartStepProps } from './types';

export default function TransferDomainStepStart( {
	className,
	pageSlug,
	onNextStep,
	progressStepList,
	domainInboundTransferStatusInfo,
	domain,
	isFetchingAvailability,
}: StartStepProps ): JSX.Element {
	const { __ } = useI18n();
	const switchToDomainConnect = () => page( MAP_EXISTING_DOMAIN );
	const isDomainTransferrable = getDomainTransferrability( domainInboundTransferStatusInfo )
		.transferrable;

	const stepContent = (
		<>
			{ ! isFetchingAvailability && ! isDomainTransferrable && (
				<Notice
					status="is-error"
					showDismiss={ false }
					text={ sprintf(
						/* translators: %s: the domain name that is being transferred (ex.: example.com) */
						__( 'The domain %s is not transferable.' ),
						domain
					) }
				></Notice>
			) }
			<div className={ className + '__transfer-start' }>
				<p className={ className + '__text' }>
					{ __(
						'For this setup you will need to log in to your current domain provider and go through a few steps.'
					) }
				</p>
				<CardHeading tagName="h2" className={ className + '__sub-heading' }>
					<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
					{ __( 'How long will it take?' ) }
				</CardHeading>
				<p className={ className + '__text' }>
					{ __( 'It takes 10-20 minutes to set up.' ) }
					<br />
					{ __(
						'It can take up to 5 days for the domain to be transferred, depending on your provider.'
					) }
				</p>
				<p className={ className + '__text' }>
					{ createInterpolateElement(
						__(
							'If you would like to have your domain point to your WordPress.com site faster, consider <a>connecting your domain</a> first.'
						),
						{
							a: createElement( 'a', {
								className: 'connect-domain-step__change_mode_link',
								onClick: switchToDomainConnect,
							} ),
						}
					) }
				</p>
				<Button
					primary
					onClick={ onNextStep }
					disabled={ ! isDomainTransferrable }
					busy={ isFetchingAvailability }
				>
					{ __( 'Start setup' ) }
				</Button>
			</div>
		</>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeadingTransfer }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}
