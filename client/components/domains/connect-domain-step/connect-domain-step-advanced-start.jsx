import { Button, MaterialIcon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import CardHeading from 'calypso/components/card-heading';
import { isSubdomain } from 'calypso/lib/domains';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug, stepsHeading } from './constants';

import './style.scss';

export default function ConnectDomainStepAdvancedStart( {
	className,
	domain,
	pageSlug,
	mode,
	onNextStep,
	progressStepList,
	setPage,
} ) {
	const { __ } = useI18n();
	const firstStep = isSubdomain( domain )
		? stepSlug.SUBDOMAIN_SUGGESTED_START
		: stepSlug.SUGGESTED_START;
	const switchToSuggestedSetup = () => setPage( firstStep );

	const message = isSubdomain( domain )
		? __(
				'This is the advanced way to connect your subdomain, using A & CNAME records. We advise using our <a>suggested setup</a> instead, with NS records.'
		  )
		: __(
				'This is the advanced way to connect your domain, using root A records & CNAME records. We advise using our <a>suggested setup</a> instead, with WordPress.com name servers.'
		  );

	const stepContent = (
		<>
			<div className={ className + '__suggested-start' }>
				<p className={ className + '__text' }>
					{ createInterpolateElement( message, {
						a: createElement( 'a', {
							className: 'connect-domain-step__change_mode_link',
							onClick: switchToSuggestedSetup,
						} ),
					} ) }
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
			heading={ stepsHeading.ADVANCED }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepAdvancedStart.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
	setPage: PropTypes.func.isRequired,
};
