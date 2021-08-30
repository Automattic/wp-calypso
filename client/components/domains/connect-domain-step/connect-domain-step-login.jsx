import { Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import React from 'react';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepsHeadingAdvanced, stepsHeadingSuggested, stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepLogin( {
	className,
	pageSlug,
	domain,
	mode,
	onNextStep,
	progressStepList,
} ) {
	const { __ } = useI18n();
	const stepContent = (
		<div className={ className + '__login' }>
			<p className={ className + '__text' }>
				{ createInterpolateElement(
					__(
						'Log into your domain provider account (like GoDaddy, NameCheap, 1&1, etc.). If you can’t remember who this is: go to <a>this link</a>, enter your domain and look at <em>Reseller Information</em> or <em>Registrar</em> to see the name of your provider.'
					),
					{
						em: createElement( 'em' ),
						a: createElement( 'a', { href: 'https://lookup.icann.org', target: '_blank' } ),
					}
				) }
			</p>
			<p className={ className + '__text' }>
				{ sprintf(
					/* translators: %s: the domain name that the user is connecting to WordPress.com (ex.: example.com) */
					__(
						'On your domain provider’s site go to the domains page. Find %s and go to its settings page.'
					),
					domain
				) }
			</p>
			<Button primary onClick={ onNextStep }>
				{ __( "I found the domain's settings page" ) }
			</Button>
		</div>
	);

	const heading = modeType.SUGGESTED === mode ? stepsHeadingSuggested : stepsHeadingAdvanced;

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ heading }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepLogin.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	domain: PropTypes.string.isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
};
