import { Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import CardHeading from 'calypso/components/card-heading';
import MaterialIcon from 'calypso/components/material-icon';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepAdvancedStart( {
	className,
	currentPageSlug,
	mode,
	onNextStep,
	onSwitchToSuggestedSetup,
	progressStepList,
} ) {
	const stepContent = (
		<>
			<Notice
				className={ className + '__advanced-start-notice' }
				status="is-warning"
				showDismiss={ false }
			>
				{ __(
					'We advise using our recommended setup instead, with WordPress.com name servers. Our advanced setup requires manually managing DNS records for any added services such as Professional Email yourself.'
				) }
				<NoticeAction onClick={ onSwitchToSuggestedSetup }>
					{ __( 'Back to recommended setup' ) }
				</NoticeAction>
			</Notice>
			<div className={ className + '__suggested-start' }>
				<p className={ className + '__text' }>
					{ createInterpolateElement(
						__(
							'This is the advanced way to connect your domain, using root A records & CNAME records. We advise using our <a>suggested setup</a> instead, with WordPress.com name servers.'
						),
						{
							a: createElement( 'a', {
								className: 'connect-domain-step__change_mode_link',
								onClick: onSwitchToSuggestedSetup,
							} ),
						}
					) }
				</p>
				<CardHeading className={ className + '__sub-heading' }>
					<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
					{ __( 'How long will it take?' ) }
				</CardHeading>
				<p className={ className + '__text' }>
					{ __( 'It takes 5 minutes to set up.' ) }
					<br />
					{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
				</p>
				<Button primary onClick={ onNextStep }>
					{ __( 'Start setup' ) }
				</Button>
			</div>
		</>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			mode={ mode }
			progressStepList={ progressStepList }
			currentPageSlug={ currentPageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepAdvancedStart.propTypes = {
	className: PropTypes.string.isRequired,
	currentPageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	onSwitchToSuggestedSetup: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
};
