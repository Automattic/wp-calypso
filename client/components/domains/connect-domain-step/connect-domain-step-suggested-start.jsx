import { Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import CardHeading from 'calypso/components/card-heading';
import { modeType, stepSlug } from 'calypso/components/domains/connect-domain-step/constants';
import MaterialIcon from 'calypso/components/material-icon';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';

import './style.scss';

export default function ConnectDomainStepSuggestedStart( {
	className,
	currentPageSlug,
	mode,
	onNextStep,
	onSwitchToAdvancedSetup,
	progressStepList,
} ) {
	const stepContent = (
		<div className={ className + '__suggested-start' }>
			<p className={ className + '__text' }>
				{ createInterpolateElement(
					__(
						'This is the easiest way to connect your domain, using name servers. If needed you can also use our <a>advanced setup</a>, using root A & CNAME records.'
					),
					{
						a: createElement( 'a', {
							className: 'connect-domain-step__change_mode_link',
							onClick: onSwitchToAdvancedSetup,
						} ),
					}
				) }
			</p>
			<CardHeading tagName="h2" className={ className + '__sub-heading' }>
				<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
				{ __( 'How long will it take?' ) }
			</CardHeading>
			<p className={ className + '__text' }>
				{ __( 'It takes 5-15 minutes to set up.' ) }
				<br />
				{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
			</p>
			<Button primary onClick={ onNextStep }>
				{ __( 'Start setup' ) }
			</Button>
		</div>
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

ConnectDomainStepSuggestedStart.propTypes = {
	className: PropTypes.string.isRequired,
	currentPageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	onSwitchToAdvancedSetup: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
};
