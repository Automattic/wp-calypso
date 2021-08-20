/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React from 'react';
/**
 * Internal dependencies
 */
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepSlug } from './constants';
/**
 * Style dependencies
 */
import './style.scss';

export default function ConnectDomainStepLogin( {
	className,
	currentPageSlug,
	domain,
	mode,
	onNextStep,
	progressStepList,
} ) {
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

ConnectDomainStepLogin.propTypes = {
	className: PropTypes.string.isRequired,
	currentPageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	domain: PropTypes.string.isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
};
