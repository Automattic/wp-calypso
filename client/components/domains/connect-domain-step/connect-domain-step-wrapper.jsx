import { Card } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import CardHeading from 'calypso/components/card-heading';
import ConnectDomainStepProgress from './connect-domain-step-progress';
import { modeType, stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepWrapper( {
	className,
	mode,
	progressStepList,
	currentPageSlug,
	stepContent,
} ) {
	const heading = modeType.SUGGESTED === mode ? __( 'Suggested setup' ) : __( 'Advanced setup' );

	const StepsProgress = (
		<ConnectDomainStepProgress
			baseClassName={ className }
			steps={ progressStepList }
			currentPageSlug={ currentPageSlug }
		/>
	);
	const showProgress = Object.keys( progressStepList ).includes( currentPageSlug );

	return (
		<Card className={ className }>
			<CardHeading className={ className + '__heading' }>{ heading }</CardHeading>
			{ showProgress && StepsProgress }
			{ stepContent }
		</Card>
	);
}

ConnectDomainStepWrapper.propTypes = {
	className: PropTypes.string,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	progressStepList: PropTypes.object.isRequired,
	currentPageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	stepContent: PropTypes.element,
};
